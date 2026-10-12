# =====================================================================
# analyze_shots.py — verifica que as capturas contêm renderização 3D real
# Para cada PNG: recorta a região central da viewport 3D, calcula
# luminância média, variância, número de cores distintas e a presença
# das cores-assinatura das organelas. Também mede a fração de pixels
# "vivos" (diferentes do fundo escuro) dentro da silhueta da célula.
# =====================================================================
import glob
import os
import sys
from collections import Counter

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
# usa as capturas da documentação por padrão; aceita um diretório como argumento
SHOTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'docs', 'screenshots')

# cores-assinatura (CIELAB não é necessário: comparação em RGB é suficiente)
SIGNATURES = {
    'membrana (azul)':    (0x7f, 0xd4, 0xff),
    'nucleo (violeta)':   (0x9b, 0x7b, 0xff),
    'mitocondria (laranja)': (0xff, 0x8a, 0x5c),
    'golgi (amarelo)':    (0xff, 0xd1, 0x66),
    're (turquesa)':      (0x4f, 0xd1, 0xc5),
    'lisossomo (rosa)':   (0xff, 0x6b, 0x9d),
    'cloroplasto (verde)': (0x4c, 0xaf, 0x50),
    'citoesqueleto (azul-claro)': (0x7e, 0xa8, 0xff),
}

def near(a, b, tol):
    return abs(a[0]-b[0]) <= tol and abs(a[1]-b[1]) <= tol and abs(a[2]-b[2]) <= tol

def analyze(path):
    im = Image.open(path).convert('RGB')
    W, H = im.size
    # região central da viewport (evita os painéis laterais e os overlays)
    x0, y0 = int(W*0.30), int(H*0.20)
    x1, y1 = int(W*0.70), int(H*0.74)
    crop = im.crop((x0, y0, x1, y1))
    px = list(crop.getdata())
    n = len(px)

    lum = [0.2126*r + 0.7152*g + 0.0722*b for (r, g, b) in px]
    mean = sum(lum)/n
    var = sum((v-mean)**2 for v in lum)/n
    bright = sum(1 for v in lum if v > 26)/n       # pixels não-fundo
    very_bright = sum(1 for v in lum if v > 90)/n  # destaques / estruturas iluminadas
    colors = len(set(px))

    counts = Counter()
    small = crop.resize((crop.width//3, crop.height//3))
    for p in small.getdata():
        if 0.2126*p[0] + 0.7152*p[1] + 0.0722*p[2] <= 22:
            continue
        for name, sig in SIGNATURES.items():
            if near(p, sig, 46):
                counts[name] += 1
                break

    return {
        'size': (W, H),
        'mean_lum': mean,
        'std_lum': var**0.5,
        'bright_frac': bright,
        'lit_frac': very_bright,
        'distinct_colors': colors,
        'signatures': counts.most_common(6),
    }

def main():
    files = sorted(glob.glob(os.path.join(SHOTS, '*.png')))
    if not files:
        print('Nenhuma captura encontrada em', SHOTS)
        return 1
    failures = []
    print(f"{'captura':30} {'lum':>6} {'desvio':>7} {'vivos':>7} {'acesos':>7} {'cores':>7}  assinaturas")
    print('-'*104)
    for f in files:
        a = analyze(f)
        sig = ', '.join(f'{k}:{v}' for k, v in a['signatures'][:3]) or '—'
        print(f"{os.path.basename(f):30} {a['mean_lum']:6.1f} {a['std_lum']:7.1f} "
              f"{a['bright_frac']*100:6.1f}% {a['lit_frac']*100:6.1f}% {a['distinct_colors']:7d}  {sig}")
        name = os.path.basename(f)
        # critérios: a cena 3D precisa ter gradiente e detalhe suficientes
        if a['std_lum'] < 8:
            failures.append(f'{name}: cena sem variação de luminância (std={a["std_lum"]:.1f})')
        if a['bright_frac'] < 0.25:
            failures.append(f'{name}: poucos pixels ativos ({a["bright_frac"]*100:.1f}%)')
        if a['distinct_colors'] < 900:
            failures.append(f'{name}: poucas cores distintas ({a["distinct_colors"]})')
        if a['lit_frac'] < 0.004:
            failures.append(f'{name}: nenhuma estrutura iluminada ({a["lit_frac"]*100:.2f}%)')

    print()
    if failures:
        print('FALHAS:')
        for f in failures:
            print('  - ' + f)
        return 1
    print(f'OK: {len(files)} capturas com renderização 3D válida.')
    return 0

if __name__ == '__main__':
    sys.exit(main())