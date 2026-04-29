from pathlib import Path
p=Path(r"C:\工作娱乐\Aola-Star-Hub\__retry_zero_skills_v3.py")
s=p.read_text(encoding='utf-8')
s=s.replace('m = re.search(r"charset\\s*=\\s*[\"\']?\\s*([a-z0-9\\-_]+)", head)', "m = re.search(r'charset\\s*=\\s*[\"\']?\\s*([a-z0-9\\-_]+)', head)")
p.write_text(s,encoding='utf-8')
print('fixed')
