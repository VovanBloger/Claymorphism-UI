from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parent.parent
vault=Path(r'D:\Projects\Vault\ClayCraft UI')
manifest=json.loads((root/'output/qa/vault-sidebar-update.json').read_text(encoding='utf-8'))
for name,expected in manifest.items():
    if expected is None:
        assert not (vault/name).exists(), f'New Vault note already exists: {name}'
    else:
        assert hashlib.sha256((vault/name).read_bytes()).hexdigest()==expected, f'Vault note changed: {name}'
for name in manifest:
    (vault/name).write_bytes((root/'docs/obsidian/ClayCraft UI'/name).read_bytes())
print(f'Saved project update: {len(manifest)} notes, preserving previous journal entries.')
