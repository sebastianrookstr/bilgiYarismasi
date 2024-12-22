const socket = io();

let hangiSorudayiz;
let cevaplamaSuresi;
let beklemeSuresi;
let yarismaBittiMi = true;

const soru = document.getElementById("soru");
const startNo = document.querySelector('#baslangicSoruNo')
const modal = document.getElementById('modal');
const modal2 = document.getElementById('modal2');
const modalText2 = document.getElementById('modal-text2');

function yarismayaBasla() {
    if (startNo.value != null && startNo.value !== "") {
        hangiSorudayiz = startNo.value;
    } else {
        hangiSorudayiz = 0;
    }
    if (yarismaBittiMi) {
        beklemeSuresi = 5;
        yarismaBittiMi = false;
        console.log(hangiSorudayiz);
        console.log("Yarışma Başladı");
        soruGetir();
        temizle();
    } else {
        console.log("Yarışma Zaten Başladı");
    }
}

function soruGetir() {
    playMusic("millionaire-heart-question.mp3");
    cevaplamaSuresi = document.getElementById('cevaplamaSuresi').value;
    soru.innerHTML = sorular[hangiSorudayiz].soru;
    console.log("Soru Getirildi");
    soruOkumayiBekle();
}

function soruOkumayiBekle() {
    console.log("Soru Okuma Bekleme Süresi Başladı");
    let okumaSuresi = beklemeSuresi;
    // let okumaSuresiGoster = document.getElementById("okumaZamanlayici");
    let okumaicinzamanlayici = setInterval(function () {
        okumaSuresi--;
        // okumaSuresiGoster.innerHTML = okumaSuresi;
        if (okumaSuresi === 0) {
            clearInterval(okumaicinzamanlayici);
            console.log("Soru Okuma Bekleme Süresi Bitti");
            cevaplariGetir();
        }
    }, 1000);
}

function cevaplariGetir() {
    const cevaplar = document.getElementById("cevaplar");
    cevaplar.innerHTML = `
          <input type="radio" name="cevapSec" value="0" id="btnA"><label for="btnA" class="cevapSecenekleri" data-name="A">${sorular[hangiSorudayiz].cevaplar[0]}</label></radio>
          <input type="radio" name="cevapSec" value="1" id="btnB"><label for="btnB" class="cevapSecenekleri" data-name="B">${sorular[hangiSorudayiz].cevaplar[1]}</label></radio>
          <input type="radio" name="cevapSec" value="2" id="btnC"><label for="btnC" class="cevapSecenekleri" data-name="C">${sorular[hangiSorudayiz].cevaplar[2]}</label></radio>
        `;
    console.log("Cevaplar Getirildi");
    socket.emit('cevaplarGosterilsin', hangiSorudayiz);
    genelZamanlayici();
}

function genelZamanlayici() {
    console.log("Genel Zamanlayıcı Başladı");
    const kalanSure = document.getElementById("zamanlayici");
    let zamanlayici = setInterval(function () {
        cevaplamaSuresi--;
        kalanSure.innerHTML = cevaplamaSuresi;
        if (cevaplamaSuresi === 0) {
            clearInterval(zamanlayici);
            console.log("Süre Bitti");
            socket.emit('herkesCevabiniYollasin', hangiSorudayiz);
            socket.emit('ekranTemizlensin');
            sonuclariGoster();
        }
    }, 1000);
}

// Kullanıcı listesi güncellendiğinde
socket.on("userList", (users) => {
    const usersList = document.getElementById("userList");
    usersList.innerHTML = ""; // Mevcut listeyi temizle

    for (let id in users) {
        const user = users[id];
        const li = document.createElement("li");
        li.textContent = `${user.name}: ${user.score} puan`;
        usersList.appendChild(li);
    }
});

function sonuclariGoster() {
    playMusic("millionaire-heyecan.mp3")
    socket.on('alSanaCevap', (users) => {
        const cevaplar = document.getElementById("verilenCevaplar");
        const puanDurumu = document.getElementById("userList");
        puanDurumu.innerHTML = "";
        cevaplar.innerHTML = "";

        /*
        Object.entries(users).forEach(eleman => {
            const [key, value] = eleman;
            value.name === user.name ? console.log(user.name + " puan kazandı :)") : console.log("puan alan yok!");
        */

        Object.entries(users).forEach(eleman => {
            const [key, value] = eleman;

            const li = document.createElement("li");
            const cevapli = document.createElement("li");
            li.textContent = `${value.name}: ${value.score}`;
            cevapli.textContent = `${value.name}: ${value.cevap}`;
            cevaplar.appendChild(cevapli);
            puanDurumu.appendChild(li);
        });


        /*
                for (let id in users) {
                    const user = users[id];
                    console.log(user.cevap);
                    console.log(sorular[hangiSorudayiz].cevaplar[sorular[hangiSorudayiz].dogruCevap]);
                    const li = document.createElement("li");
                    const cevapli = document.createElement("li");
                    li.textContent = `${user.name}: ${user.score}`;
                    cevapli.textContent = `${user.name}: ${user.cevap}`;
                    cevaplar.appendChild(cevapli);
                    puanDurumu.appendChild(li);
                    if (user.cevap === sorular[hangiSorudayiz].cevaplar[sorular[hangiSorudayiz].dogruCevap]) {
                        console.log(user.name + " Aferin, Doğru Bildin :)");
                        socket.emit("puanArtsin", user);
                    } else {
                        console.log(user.name + " Üzgünüm yanlış cevap :(");
                    }
                }
        */

        modal.style.display = "block";
        modal.addEventListener('click', () => {
            modal.style.display = "none";
            cevapGoster();
        });
    });
    document.querySelectorAll('input[name="cevapSec"]').forEach((input) => {
        input.disabled = true;
    });


    // Doğru cevabı gösteren modal
    function cevapGoster() {
        // Modal'ı göster
        playMusic("millioner-answer.mp3");
        modal2.style.display = "block";
        modalText2.innerHTML = `<h3>DOĞRU CEVAP </h3>${sorular[hangiSorudayiz].cevaplar[sorular[hangiSorudayiz].dogruCevap]}`;

        // Modal'ı kapatmak için
        modal2.addEventListener('click', () => {
            modal2.style.display = "none";
        });
    }
}

function sonrakiSoruyaGec() {
    if (hangiSorudayiz < sorular.length - 1 && cevaplamaSuresi === 0) {
        hangiSorudayiz++;
        temizle();
        soruGetir();
    } else if (hangiSorudayiz === sorular.length - 1) {
        console.log("Yarışma Bitti");
        yarismaBittiMi = true;
    } else {
        console.log("Süre Bitmedi");
    }
}

function temizle() {
    const inputlar = document.querySelectorAll('input[name="cevapSec"]');
    const labeller = document.querySelectorAll(".cevapSecenekleri");
    for (let i = 0; i < inputlar.length; i++) {
        inputlar[i].remove();
        labeller[i].remove();
    }
}

const sorular = [
    {
        soru: "Dünyanın en büyük okyanusu hangisidir?",
        cevaplar: ["Atlas Okyanusu", "Pasifik Okyanusu", "Hint Okyanusu"],
        dogruCevap: "1",
    },
    {
        soru: "Türkiye'nin başkenti neresidir?",
        cevaplar: ["İstanbul", "Ankara", "İzmir"],
        dogruCevap: "1",
    },
    {
        soru: "Einstein'ın ünlü denklemi nedir?",
        cevaplar: ["E = mc²", "F = ma", "P = mv"],
        dogruCevap: "0",
    },
    {
        soru: "Amerika Birleşik Devletleri'nin bağımsızlık günü hangi tarihte kutlanır?",
        cevaplar: ["1 Temmuz", "4 Temmuz", "14 Temmuz"],
        dogruCevap: "1",
    },
    {
        soru: "Bir yılın 365 gün olduğu takvim hangi takvimdir?",
        cevaplar: ["Gregoryen Takvimi", "Miladi Takvim", "Hicri Takvim"],
        dogruCevap: "0",
    },
    {
        soru: "Mona Lisa tablosu hangi sanatçıya aittir?",
        cevaplar: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso"],
        dogruCevap: "1",
    },
    {
        soru: "Birleşmiş Milletler'in merkezi hangi şehirde bulunmaktadır?",
        cevaplar: ["Paris", "New York", "Londra"],
        dogruCevap: "1",
    },
    {
        soru: "Dünyanın en büyük çölü hangisidir?",
        cevaplar: ["Sahra Çölü", "Antarktika", "Gobi Çölü"],
        dogruCevap: "1",
    },
    {
        soru: "Shakespeare'in ünlü dramalarından biri nedir?",
        cevaplar: ["Macbeth", "Don Kişot", "Moby Dick"],
        dogruCevap: "0",
    },
    {
        soru: "Hangi gezegen güneşe en yakın olanıdır?",
        cevaplar: ["Venüs", "Mars", "Merkür"],
        dogruCevap: "2",
    },
    {
        soru: "Hangi elementin kimyasal sembolü 'O' dur?",
        cevaplar: ["Oksijen", "Osmiyum", "Ondanium"],
        dogruCevap: "1",
    },
    {
        soru: "Hangi ülke dünyanın en büyük yüzölçümüne sahiptir?",
        cevaplar: ["Rusya", "Kanada", "Çin"],
        dogruCevap: "0",
    },
    {
        soru: "Türkiye'nin en uzun nehri hangisidir?",
        cevaplar: ["Fırat", "Dicle", "Kızılırmak"],
        dogruCevap: "2",
    },
    {
        soru: "Mısırlıların piramitleri inşa ettiği eski başkent neresidir?",
        cevaplar: ["Luksor", "Memfis", "Kahire"],
        dogruCevap: "1",
    },
    {
        soru: "Türk mutfağının en bilinen tatlılarından biri hangisidir?",
        cevaplar: ["Baklava", "Pasta", "Tiramisu"],
        dogruCevap: "0",
    },
    {
        soru: "Dünyadaki en yüksek dağ hangisidir?",
        cevaplar: ["Everest", "K2", "Fitz Roy"],
        dogruCevap: "0",
    },
    {
        soru: "Efsanevi Yunan tanrısı Zeus'un hangi silahı vardır?",
        cevaplar: ["Mızrak", "Şimşek", "Kalkan"],
        dogruCevap: "1",
    },
    {
        soru: "Fransa'nın ulusal marşı nedir?",
        cevaplar: ["La Marseillaise", "Ode to Joy", "God Save the Queen"],
        dogruCevap: "0",
    },
    {
        soru: "Bir futbol maçında her takımın kaç oyuncusu sahada bulunur?",
        cevaplar: ["9", "10", "11"],
        dogruCevap: "2",
    },
    {
        soru: "İlk Türk Cumhuriyeti hangi devlet tarafından kurulmuştur?",
        cevaplar: [
            "Türkiye Cumhuriyeti",
            "Azerbaycan Cumhuriyeti",
            "Kırgızistan Cumhuriyeti",
        ],
        dogruCevap: "0",
    },
];

let currentAudio = null; // Şu an çalan müziği tutacak değişken

// Müzik çalma fonksiyonu
function playMusic(musicFile) {
    // Eğer zaten bir müzik çalıyorsa, önce durdur
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // Müzik başladığı yere sıfırlanmasın
    }

    // Yeni müzik çal
    currentAudio = new Audio(`/music/${musicFile}`);
    currentAudio.play();
}
