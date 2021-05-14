# stringstonumbers

`stringstonumbers` is a very simple `npm` package that converts any string input into a number and back. It was created to be used with the scratch-api module for transferring data over scratch cloud servers.

## How to use

### With npm

`npm install stringstonumbers`

#### Importing

```javascript
const strToNum = require('stringstonumbers');
```

### HTML
###### Want to use the script in the browser? No problem! Just import the script!

```html
<script type="application/javascript" src="https://cdn.jsdelivr.net/gh/ErrorGamer2000/stringstonumbers/index.js"></script>
```
### Encoding

```javascript
strToNum.encode('Hello World!')
// returns "07303737409122404337296200"
```

### Decoding

```javascript
strToNum.decode('07303737409122404337296200')
// returns "Hello World!"
```
