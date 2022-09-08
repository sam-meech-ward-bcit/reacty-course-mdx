const fs = require('fs')
const path = require('path')
const parseMarkdown = require('front-matter-markdown')

const content = fs.readdirSync(path.resolve(__dirname, '../content'))

console.log(content)

const courseIndex = content.find((file) => file === "_index.md")

const isDir = (path) => fs.lstatSync(path).isDirectory()
const isFile = (path) => fs.lstatSync(path).isFile()

let sections = []
for (let section of content) {
  // check is a dir
  const sectionPath = path.resolve(__dirname, '../content', section)
  if (isDir(sectionPath)) {

    const fileNames = fs.readdirSync(sectionPath)
    const sectionIndex = fileNames.find((file) => file === "_index.md")
    if (!sectionIndex) {
      continue
    }

    const sectionIndexMeta = parseMarkdown(fs.readFileSync(path.resolve(sectionPath, sectionIndex)))
    if (!sectionIndexMeta.section || sectionIndexMeta.draft) {
      continue
    }

    const files = []
    for (let file of fileNames) {
      if (file === "_index.md") {
        continue
      }
      if (isFile(path.resolve(sectionPath, file))) {
        const fileMeta = parseMarkdown(fs.readFileSync(path.resolve(sectionPath, file)))
        if (!fileMeta.draft && fileMeta.title) {
          files.push({
            ...fileMeta,
            fileName: file,
            path: path.join(section, file)
          })
        }
      }
    }
    
    sections.push({
      section: sectionIndexMeta,
      files: files.sort((a, b) => a.weight - b.weight)
    })
  }
}

sections = sections.sort((a, b) => a.weight - b.weight)

fs.writeFileSync(path.resolve(__dirname, '../build.json'), JSON.stringify(sections, null, 2))