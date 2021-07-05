#!/usr/bin/env node

const http = require("http");
const fs = require('fs');
const fse = require('fs-extra');
const fetch = require('node-fetch')

const param = process.argv.slice(2), index = param[0]
const { input, output , main } = require(`${__dirname}/${index}`)

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
    const srcDir = input+'/'+eachpath
    const destDir = output+'/'+eachpath
    fse.copySync(srcDir, destDir,{ overwrite: true}, function (err) {
      if (err) {      
        console.log(err);      
      } else {
        console.log(`${eachpath} is copied from ${input} from ${output}`);
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
    const pathFormRoot = `${input}/${path}.xht`
    const text = fs.readFileSync(pathFormRoot,'utf8')
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
  let folderName = output
  for (let i = 0; i < path.length; i++) {
    folderName += '/' +path[i]
    mkdir(`${folderName}`)
  }
  try {
    const pathFormRoot = `${output}/${outPutPath}/index.html` 
    fs.writeFileSync(pathFormRoot, res)
    console.log(`File written to ./${output}/${outPutPath}/index.html`)
  } catch (error) {
    console.log(error);
  }
}

const $html = async (data, inputTemp, outputHtml) => {
  try {
    const pathFormRoot = `${input}/${inputTemp}.xht`
      const text = fs.readFileSync(pathFormRoot, 'utf8')
      const res = await transform(data, text)
      write(outputHtml, res)
  } catch (err) {
      console.error(err)
  }
}

const server = (port=8000) => {
  const host = 'localhost';    
  const requestListener = function (req, res) {
    const path = `${output}/${req.url}/index.html`
    try {
        const file = fs.readFileSync(path)
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(file);
    } catch (error) {
        res.writeHead(500);
        res.end(`error is ${error}`)
        return
    }
  };
  
  try {
    const server = http.createServer(requestListener);
    server.listen(port, host, () => {
        console.log(`Server is running on http://${host}:${port}`);
    });
    
  } catch (error) {
      console.log(error);
  }
}

const checkDev = () => {
  if(param[1] && param[1] === "--dev"){
    let port 
    if (param[1] && param[1] === "-p") port = param[2] /*parseInt(param[3])*/    
    // console.log(param);
    server(port)
  }
}

mkdir(output)

main({ $html, $each, $include, $passCopy, $fetch })
  .then(checkDev)
  .catch(err => console.error(err))

