"""Copy the prepared project knowledge into the user's explicitly requested Vault.
Writes are limited to the new ClayCraft UI section and one registry table row.
Run with --dry-run to inspect the exact target paths without writing.
"""
from pathlib import Path
import sys

PROJECT = Path(__file__).resolve().parent.parent
VAULT = Path(r'D:\Projects\Vault')
SOURCE = PROJECT / 'docs' / 'obsidian' / 'ClayCraft UI'
DEST = VAULT / 'ClayCraft UI'
REGISTRY = VAULT / '00 Система' / '03 Реестр проектов и навигация.md'
ROW = '| ClayCraft UI — `D:\\Projects\\ClayCraft ui - дизайн система и генератор soft 3D claymorphism` | [[ClayCraft UI/00 Обзор ClayCraft UI|Обзор ClayCraft UI]] | [[ClayCraft UI/Канбан ClayCraft UI|Канбан ClayCraft UI]] | [[ClayCraft UI/Журнал Передачи Смены|Эстафета ClayCraft UI]] |'

assert VAULT.is_dir() and REGISTRY.is_file()
assert DEST.parent.resolve() == VAULT.resolve()
# Re-read the registry immediately before mutation, preserving all unrelated entries.
registry = REGISTRY.read_text(encoding='utf-8-sig')
if '| ClayCraft UI —' not in registry:
    anchor = '| Сам Vault —'
    assert anchor in registry, 'Registry structure changed; inspect manually.'
    updated_registry = registry.replace(anchor, ROW + '\n' + anchor, 1)
else:
    assert ROW in registry, 'A different ClayCraft registry entry now exists; inspect before merging.'
    updated_registry = registry

files = [(p, DEST / p.name) for p in SOURCE.glob('*.md')]
files += [(p, DEST / 'Референсы' / p.name) for p in (PROJECT / 'public/assets/references').iterdir() if p.is_file()]
files += [(PROJECT / 'output/qa' / name, DEST / 'Проверки' / name) for name in ['final-desktop.jpg', 'final-mobile.jpg']]
for src, target in files:
    assert src.is_file()
    assert target.resolve().is_relative_to(DEST.resolve())
    if target.exists() and target.read_bytes() != src.read_bytes():
        raise RuntimeError(f'Target already contains different content: {target}. Inspect before merging.')
    print(target)
print(REGISTRY)
if '--dry-run' not in sys.argv:
    for src, target in files:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(src.read_bytes())
    if updated_registry != registry:
        REGISTRY.write_text(updated_registry, encoding='utf-8')
    print(f'SAVED: {len(files)} files and registry entry')
else:
    print(f'DRY RUN: {len(files)} files and registry entry; no writes')
