"use strict";

class App extends React.Component {
    constructor(props) {
        super(props);
        // Käytetään samaa tietorakennetta kuin viikkotehtävässä 1, mutta vain jäärogainingin joukkueita
        // tehdään tämän komponentin tilaan kopio jäärogainingin tiedoista. Tee tehtävässä vaaditut lisäykset ja muutokset tämän komponentin tilaan
        // Tämä on tehtävä näin, että saadaan oikeasti aikaan kopio eikä vain viittausta samaan tietorakenteeseen. Objekteja ja taulukoita ei voida kopioida vain sijoitusoperaattorilla
        // päivitettäessä React-komponentin tilaa on aina vanha tila kopioitava uudeksi tällä tavalla
        // kts. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
        let kilpailu = new Object();
        kilpailu.nimi = data[2].nimi;
        kilpailu.loppuaika = data[2].loppuaika;
        kilpailu.alkuaika = data[2].alkuaika;
        kilpailu.kesto = data[2].kesto;
        kilpailu.leimaustapa = Array.from(data[2].leimaustapa);
        kilpailu.rastit = Array.from(data[2].rastit);
        function kopioi_joukkue(j) {
            if (j != undefined) {
                let uusij = {};
                uusij.nimi = j.nimi;
                uusij.id = j.id;

                uusij["jasenet"] = Array.from(j["jasenet"]);
                uusij["rastit"] = Array.from(j["rastit"]);
                uusij["leimaustapa"] = Array.from(j["leimaustapa"]);
                return uusij;
            }

        }
        function kopioi_sarja(s) {
            let uusis = {};
            uusis.nimi = s.nimi;
            uusis.alkuaika = s.alkuaika;
            uusis.loppuaika = s.loppuaika;
            uusis.kesto = s.kesto;
            uusis.joukkueet = Array.from(s.joukkueet, kopioi_joukkue);
            return uusis;
        }

        kilpailu.sarjat = Array.from(data[2].sarjat, kopioi_sarja);

        // tuhotaan vielä alkuperäisestä tietorakenteesta rastit ja joukkueet niin
        // varmistuuu, että kopiointi on onnistunut
        for (let i in data[2].rastit) {
            delete data[2].rastit[i];
        }
        for (let sarja of data[2].sarjat) {
            for (let i in sarja.joukkueet) {
                delete sarja.joukkueet[i];
            }
        }
        //        console.log( kilpailu );
        //        console.log(data);
        this.state = { "kilpailu": kilpailu };
        return;
    }
    render() {
        return <div>
            <LisaaJoukkue kilpailu={this.state.kilpailu} />


        </div>;
    }
}

class LisaaJoukkue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nimi: "",
            radio: "2h",
            checkbox: [],
            kilpailu: this.props.kilpailu,
            jasenet: { jasen1: "", jasen2: "", jasen3: "", jasen4: "", jasen5: "" },
            rastit: [],
            jasen: ""
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleInsert = this.handleInsert.bind(this);
    }

    handleChange(event) {
        let obj = event.target;
        let arvo = obj.value;
        let kentta = obj.name;
        let type = obj.type;
        let checked = obj.checked;
        let validity = obj.validity;
        let newstate = {};
        if (kentta == "nimi") {
            console.log("jaa");
            if (arvo.replace(/\s/g, '').length < 2) {
                console.log(arvo.replace(/\s/g, '').length);
                obj.setCustomValidity("Joukkueen nimi ei saa olla tyhjä");
                newstate[kentta] = arvo;
                this.setState(newstate);
                return;
            } else {
                obj.setCustomValidity("");
            }
        }

        if (kentta == "jasen1" || kentta == "jasen2") {
            if (arvo.replace(/\s/g, '') == "") {
                obj.setCustomValidity("Joukkueella täytyy olla vähintään 2 jäsentä");
                newstate[kentta] = arvo;
                this.setState(newstate);
                return;
            }
        }
        else {
            obj.setCustomValidity("");

        }
        if (type == "checkbox") {
            newstate[kentta] = this.state[kentta].slice(0); // tehdään kopio, koska alkuperäistä ei voi suoraan käyttää. Huom. tämä slice-temppu ei riitä, jos taulukossa on objekteja. Ei siis tee "deep" kloonia
            if (checked) {
                // lisätään
                newstate[kentta].push(arvo);
            }
            else {
                // poistetaan
                newstate[kentta].splice(newstate[kentta].indexOf(arvo), 1);
            }
            //käytännössä jäsenten lisäys samaan tapaan, kuin leimaustapojen TÄMÄ ei toimi
        }
        // kaikki muut kuin checkboxit menevät helposti
        else {
            //minusta tämä jäsenten hoito on todella typerästi tehty, mutta mulla loppu aika ja mielikuvitus :)
            if (kentta == "jasen1") {
                this.state.jasenet.jasen1 = arvo;
            }
            if (kentta == "jasen2") {
                this.state.jasenet.jasen2 = arvo;
            }
            if (kentta == "jasen3") {
                this.state.jasenet.jasen3 = arvo;
            }
            if (kentta == "jasen4") {
                this.state.jasenet.jasen4 = arvo;
            }
            if (kentta == "jasen5") {
                this.state.jasenet.jasen5 = arvo;
            }
            else {
                newstate[kentta] = arvo;
            }

        }
        //this.state.jasenet.push(arvo);
        this.setState(newstate);
    }
    //lisäyksen hoito
    handleInsert(event) {
        event.preventDefault();
        let obj = event.target;
        console.log(obj);
        //alustetaan formi
        /*let newstate = {
            nimi: "",
            radio: "radio1",
            checkbox: [],
            kilpailu: this.props.kilpailu
        }*/
        //haetaan uniikki id
        let haettuSarj = 0;
        let idNro = 0;
        let kilpailu = this.state.kilpailu;
        let jasenetApu = [];
        //käydään objectin valuet läpi ja lisätään jäseniin ne mitkä eivät ole tyhjiä
        for (let [key, value] of Object.entries(this.state.jasenet)) {
            if (value.replace(/\s/g, '') != "") {
                jasenetApu.push(value);
            }
        }
        console.log(jasenetApu)
        //tarkastetaan, että lisättävät asiat ovat oikein
        let nimiApu = this.state.nimi.replace(/\s/g, '');
        if ((nimiApu != "" && nimiApu != "") && jasenetApu.length > 0) {
            console.log("onnistui!" + this.state.nimi.length);
            for (let s in kilpailu.sarjat) {
                //otetaan samalla ylös mihin sarjaan joukkue lisätään
                if (kilpailu.sarjat[s].nimi == this.state.radio) {
                    haettuSarj = s;
                }
                for (let j in kilpailu.sarjat[s].joukkueet) {
                    //arvotaan uusi id
                    idNro = Math.floor(Math.random() * 9999999999999999) + 4000000000000000;
                    for (let r in kilpailu.sarjat[s].joukkueet[j]) {
                        if (kilpailu.sarjat[s].joukkueet[j].id == idNro) {
                            idNro = Math.floor(Math.random() * 9999999999999999) + 4000000000000000;
                            r--;
                        }
                    }
                }
            }

            kilpailu.sarjat[haettuSarj].joukkueet.push({
                nimi: this.state.nimi,
                jasenet: jasenetApu,
                id: idNro,
                rastit: this.state.rastit,
                leimaustapa: this.state.checkbox
            });
        }
        this.setState({ "kilpailu": kilpailu });
        console.log(kilpailu.sarjat[haettuSarj].joukkueet);

    }

    render() {

        return (
            <React.Fragment>
                <div><ListaaJoukkue kilpailu={this.state.kilpailu} /></div>

                <div className="forms" >  <form method="post" onSubmit={this.handleInsert}>
                    <h2>Lisää joukkue</h2>
                    <fieldset>
                        <legend>Joukkueen tiedot</legend>
                        <label>Nimi <input required="required" onChange={this.handleChange} type="text" name="nimi" /></label>
                        <p id="leimP">Leimaustapa</p>
                        <li id="leimaus">
                            <label id="leimausLabel">GPS <input id="leimausTyyppi" onChange={this.handleChange} type="checkbox" value="GPS" name="checkbox" checked={this.state.checkbox.includes("GPS")} /></label>
                            <label id="leimausLabel">NFC <input id="leimausTyyppi" onChange={this.handleChange} type="checkbox" value="NFC" name="checkbox" checked={this.state.checkbox.includes("NFC")} /></label>
                            <label id="leimausLabel">QR <input id="leimausTyyppi" onChange={this.handleChange} type="checkbox" value="QR" name="checkbox" checked={this.state.checkbox.includes("QR")} /></label>
                            <label id="leimausLabel">Lomake <input id="leimausTyyppi" onChange={this.handleChange} type="checkbox" value="Lomake" name="checkbox" checked={this.state.checkbox.includes("Lomake")} /></label>
                        </li>
                        <p id="sarjaP">Sarja</p>
                        <li id="sarja">
                            <label id="sarjaLabel">2h <input name="sarjatNimi" onChange={this.handleChange} type="radio" value="2h"
                                checked={this.state.radio === "2h"} name="radio" /></label>
                            <label id="sarjaLabel">4h <input name="sarjatNimi" onChange={this.handleChange} type="radio" value="4h"
                                checked={this.state.radio === "4h"} name="radio" /></label>
                            <label id="sarjaLabel">8h <input name="sarjatNimi" onChange={this.handleChange} type="radio" value="8h"
                                checked={this.state.radio === "8h"} name="radio" /></label>
                        </li>

                    </fieldset>
                    <fieldset>
                        <legend>Jäsenet</legend>
                        <label>Jäsen 1 <input required="required" onChange={this.handleChange} type="text" name="jasen1" /></label>
                        <label>Jäsen 2 <input required="required" onChange={this.handleChange} type="text" name="jasen2" /></label>
                        <label>Jäsen 3 <input onChange={this.handleChange} type="text" name="jasen3" /></label>
                        <label>Jäsen 4 <input onChange={this.handleChange} type="text" name="jasen4" /></label>
                        <label>Jäsen 5 <input onChange={this.handleChange} type="text" name="jasen5" /></label>

                    </fieldset>
                    <p><button type="submit">Tallenna</button></p>
                </form>

                </div>

            </React.Fragment>
        )
    }

}

//näiden nimissä ei ole nyt mitään järkeä
class ListaaSarjat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            joukkueet: this.props.taulukko
        };
    }
    render() {
        let self = this;
        let sarjat = [];
        for (let j of this.state.joukkueet) {
            let jkey = j.id;
            sarjat.push(<li key={jkey}>{j.nimi}</li>)
        }
        return (
            <React.Fragment>
                {
                    sarjat
                }
            </React.Fragment>
        );
    }
}

function JoukkueSort(a, b) {
    if (a["nimi"].toUpperCase() < b["nimi"].toUpperCase()) {
        return -1;
    }
    if (a["nimi"].toUpperCase() > b["nimi"].toUpperCase()) {
        return 1;
    }
    return 0;
}

class ListaaJoukkue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            kilpailu: this.props.kilpailu,
            kaikki: this.props.kilpailu,
            teams: []
        };
    }

    render() {

        for (let s of this.state.kilpailu.sarjat) {
            for (let j of s.joukkueet) {
                if (!this.state.teams.includes(j)) {
                    this.state.teams.push(j);
                }

            }
        }
        // console.log(this.state.teams);
        this.state.teams.sort(JoukkueSort);
        return (
            <div className="lists">
                <h2>Joukkueet</h2>
                <ul>
                    <ListaaSarjat taulukko={this.state.teams} />
                </ul>
            </div>
        );
    }
}


ReactDOM.render(
    <App />,
    document.getElementById('root')

);
