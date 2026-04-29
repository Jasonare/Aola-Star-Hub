from pathlib import Path
p=Path(r"C:\工作娱乐\Aola-Star-Hub\__retry_zero_skills_v3.py")
lines=p.read_text(encoding='utf-8').splitlines()
out=[]
for ln in lines:
    if ln.strip().startswith('m = re.search(') and 'charset' in ln:
        out.append('    m = re.search("charset\\s*=\\s*[\\\"\\\']?\\s*([a-z0-9\\-_]+)", head)')
    else:
        out.append(ln)
p.write_text('\n'.join(out)+'\n',encoding='utf-8')
print('replaced line')
