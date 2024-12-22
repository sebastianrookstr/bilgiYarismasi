const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Kullanıcıların isimleri ve puanlarını tutmak için bir obje
let users = {};

// public klasörünü static olarak sunmak
app.use(express.static('public'));

// index.html sayfasına yönlendiren route
app.get('/', (req, res) => {
    res.sendFile(__dirname + 'public/index.html');
});

// admin.html sayfasına yönlendiren route
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + 'public/admin.html');
});

// Socket.io ile bağlantı kurulduğunda
io.on('connection', (socket) => {
    console.log("Bir kullanici baglandi: " + socket.id);

    /*
        // Kullanıcı adını aldıktan sonra kullanıcıyı listeye ekle
        socket.on('newUser', (username) => {
            users.push(username);
            io.emit('userList', users); // Tüm bağlı kullanıcılara yeni kullanıcı listesini gönder
        });
    */

    // Kullanıcı ismini alıp, users objesine ekliyoruz
    socket.on("newUser", (name) => {
        users[socket.id] = {name: name, cevap: null, score: 0};
        console.log("User added: ", users[socket.id]);
        io.emit("userList", users); // Admin'e güncel kullanıcı bilgilerini gönder
    });

    // Puan artışı
    socket.on("puanArtsin", (user) => {
        console.log(user.name);

        Object.entries(users).forEach(eleman => {
            const [key, value] = eleman;
            // value.name === user.name ? console.log(user.name + " puan kazandı :)") : console.log("puan alan yok!");
            value.name === user.name ? value.score += 1 : console.log("puan alan yok!");
            io.emit("userList", users); // Admin'e güncel puanları gönder
            // console.log(value.name);
            // console.log(key, value);
        })
        // users.name === user.name ? console.log(user.name + " puan kazandı :)") : console.log("puan alan yok!");
        if (user[socket.id]) {
            // users[socket.id].score += 1;
            console.log("puan artırıldı!");
            // io.emit("userList", users); // Admin'e güncel puanları gönder
        }
        /*
        if (users[socket.id]) {
            users[socket.id].score += 1;
            io.emit("userList", users); // Admin'e güncel puanları gönder
        }*/
    });

    socket.on('cevaplarGosterilsin', (hangiSorudayiz) => {
        io.emit('cevaplar', hangiSorudayiz);
    });
    socket.on('ekranTemizlensin', () => {
        io.emit('temizle');
    });
    socket.on('herkesCevabiniYollasin', (deger) => {
        io.emit('cevapYolla', deger);
    })

    socket.on('isteCevabim', (deger) => {
        users[socket.id].cevap = "";
        if(users[socket.id]){}
        users[socket.id].cevap = deger[0];
        users[socket.id].score += deger[1];
        io.emit('alSanaCevap', users);
    })

    // Bağlantı kesildiğinde kullanıcıyı listeden çıkar
    socket.on('disconnect', () => {
        // console.log("User disconnected: " + users[socket.id].name);
        console.log('Bir kullanıcı ayrıldı');
    });
});

// Sunucuyu baslat
server.listen(3000, () => {
    console.log('Sunucu http://localhost:3000 adresinde çalışıyor');
});

// Vercel API function olarak sunucuyu başlat
module.exports = (req, res) => {
    server(req, res); // serverless fonksiyon olarak çalıştır
  };