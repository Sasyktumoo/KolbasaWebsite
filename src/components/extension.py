import pandas as pd, pathlib, math

asg = pd.read_csv(pathlib.Path(__file__).parent.parent / "ec2_capacity.csv")
minutes = len(asg.index) * 1    # 1-minute resolution in that CSV
cost  = minutes/60 * 0.0104     # t3.micro price

requests = pd.read_csv("../ec2_hash_run1_stats.csv")
r_total  = requests.loc[requests.Name=="/hash","Requests"].item()

print(f"Cost for this run : ${cost:0.3f}")
print(f"Requests served   : {r_total:,}")
print(f"Cost per 1k req   : ${cost/r_total*1000:0.4f}")