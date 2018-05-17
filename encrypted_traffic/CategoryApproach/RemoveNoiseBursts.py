import os, csv

if os.path.isfile("noNoise.csv"):
    os.remove("noNoise.csv")

with open("noNoise.csv","a") as noise:
    with open("features.csv","r") as feat:
        features = csv.reader(feat)
        noNoise = csv.writer(noise)

        for row in features:
            if row[1] != "0":
                noNoise.writerow(row)
