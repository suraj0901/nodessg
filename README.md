# nodessg

## Install

```
npm install nodessg
```

### Node API

```js
module.exports = ({
    input : 'src',
    output: 'dist'
    main : async ({$html, $each, $passCopy, $fetch}) => {
        try {
            const posts = await (await $fetch('https://jsonplaceholder.typicode.com/posts')).json()
            $html({}, 'home', '')
            $html({posts}, 'posts', 'posts')
            $each(posts, post => $html(post, 'post', `posts/${post.id}`))        
            $passCopy(['./css', './index.js'])
        } catch (error) {
            console.error(error);
        }
})
```
### CLI

```
nodessg filename [option]

Option:
  --dev  development mode
  -p     specify port number  
```

### Template
post.html
```
    {$include({},'component/nav')}
    <h3>{data.title}</h3>
    <p>{data.body}</p>
    </ol>
```
posts.html
```    
    {$include({},'component/nav')}
    <h1>POST</h1>
    <ol> 
        {$each(data.posts, post => `<li><h3><a href="/posts/${post.id}">${post.title}</h3></li>` )}
    </ol>
```
