import sharp from "sharp"
import { promises as fs } from "fs"
import path from "path"

const TARGETS = [
  "espirulina-energia-que-esperar-por-semana",
  "dolor-cervical-por-estres-y-postura",
  "calor-o-frio-para-el-cuello-como-usarlos-bien",
]

const DIR = path.resolve("public/images/blog")

for (const slug of TARGETS) {
  const file = path.join(DIR, `${slug}.jpg`)
  const tmp = path.join(DIR, `${slug}.tmp.jpg`)
  const beforeBytes = (await fs.stat(file)).size

  await sharp(file)
    .resize(1600, 893, { fit: "cover", position: "attention" })
    .jpeg({ quality: 84, mozjpeg: true, progressive: true })
    .toFile(tmp)

  await fs.rename(tmp, file)
  const afterBytes = (await fs.stat(file)).size
  const before = (beforeBytes / 1024).toFixed(0)
  const after = (afterBytes / 1024).toFixed(0)
  console.log(`${slug}: ${before} KB → ${after} KB`)
}
