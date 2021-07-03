#!usr/bin/env node

const server = require('./server')
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const fetch = require('node-fetch')

const param = process.argv.slice(2), index = param[0], dev = param[1] === "--dev"
console.log(param);

const { config, main } = require(__dirname + '/' +index)

const $fetch = async (path) => {
  try {
    const data = await fetch(path)
    return data
  } catch (error) {
    console.error(error);    
  } 
}

const $passCopy = (arr) => {
  arr.forEach((eachpath) => {
    const srcDir = path.join(__dirname, config.input, eachpath)
    const destDir = path.join(__dirname, config.output, eachpath)
    fse.copySync(srcDir, destDir,{ overwrite: true}, function (err) {
      if (err) {      
        console.log(err);      
      } else {
        console.log(`${eachpath} is copied from ${config.input} from ${config.output}`);
      }
    })
  })
}

const $each = (array , func) => {
  let result= ""
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    result += func(element)
  }
  return result
}

const transform = async (data, text) => {
  let len = text.length
  let flag = []
  let count = 0
  let result = text
  try {
    for (let i = 0; i < len; i++) {
      const curr = text[i]
      if (curr === "{") flag.push(i), count++
      if (curr === "}") {
        const pos = flag.pop()
        count--
        if (count === 0) {
          const substr = text.slice(pos, i+1)
          const sub = substr.slice(1,-1)
          const output = await eval(sub)
          result = result.replace(substr, output)
        }
      }
    } 
    return result
  } catch (error) {
    console.error(error)
  }
}

const $include = async (data = {}, path ) => {
  try {
    const text = fs.readFileSync(`./${config.input}/${path}.xht`,'utf8')
    const res = await transform(data, text)
    return res
  } catch (error) {
    console.log(error);
  }
}

const mkdir = dirname => {
  try {
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname)
    }
  } catch (err) {
    console.error(err)
  }  
}

const write = (outPutPath, res) => {
  const path = outPutPath.split('/')
  let folderName = `./${config.output}`
  for (let i = 0; i < path.length; i++) {
    folderName += '/' +path[i]
    mkdir(`${folderName}`)
  }
  fs.writeFileSync(`./${config.output}/${outPutPath}/index.html`, res)
  console.log(`File written to ./${config.output}/${outPutPath}/index.html`)
}

const $html = async (data, input, output) => {
  try {
      const text = fs.readFileSync(`./${config.input}/${input}.xht`, 'utf8')
      const res = await transform(data, text)
      write(output, res)
  } catch (err) {
      console.error(err)
  }
}

mkdir(config.output)

main({$html, $include, $each, $fetch, $passCopy})
  .then(() => {
    if (dev) {
      const p = (param[2] === "-p")
      const para = {
        output : config.output
      } 
      if (p) para.port = param[3] /*parseInt(param[3])*/    
      server(para)
    } 
  })
  .catch(err => console.error(err))