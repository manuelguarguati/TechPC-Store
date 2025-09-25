const express = require('express');
const path = require('path');
const app = express();
const Port = 3000;


app.use(express.static(path.join(__dirname, 'public')));



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'home.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});
app.listen(Port, () => {
    console.log(`el servido en  http://localhost:${Port}`);
});