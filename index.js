const IMG_STREET = 'assets/background/street.png';

// format: [[narration, img for characters, img for background], [points to, option text], [points to, option text]...]
var data= {
    'init'      : [['It has been a long day. The road home is cold. A cat approaches! What do you do?', 'assets/catssets/catinit.png', IMG_STREET],
                    ['talk', 'talk'], ['approach', 'approach'], ['ignore', 'ignore']],

    'talk'      : [['"Hello, sir cat! How are you doing?" you say.\n"Absolutely terrible!" says the cat. "No one has been coming to my diner."', 'assets/catssets/talk.png', IMG_STREET],
                    ['sympathize', 'sympathize'], ['awkward', 'uh, ok']],
    'approach'  : [['The cat moves away from you and leads you down a dark alley, leaving behind a little basket of goodies.', 'assets/catssets/lookingback.png', IMG_STREET],
                    ['follow', 'follow'], ['investigate', 'investigate']],
    'ignore'     : [['"You try to escape your fate?", says the cat. "Square up, human."', 'assets/catssets/fight.png', IMG_STREET],
                    ['fight', 'fight'], ['apologize', 'apologize']],

    'sympathize': [['"How terrible," you say.\n"Yes! Ever since Big Chicken opened, my customers have been leaving one by one," says the cat, wiping a tear from its eye.', 'assets/catssets/sad.png', IMG_STREET],
                    ['comfort', 'help'], ['break', 'take a break']],
    'awkward'   : [['"Oh, uh." you say, and turn to leave.\n"Wait!" The cat stops you. "Here, have a sample and the menu. If you\'re looking for somewhere to eat, Kato\'s Rats is the place to go!"', 'assets/catssets/advertisement.png', IMG_STREET]],
    'follow'    : [['You follow the cat down the long alleyway, until you come to a little diner. You follow the cat inside.', 'assets/catssets/blank.png', 'assets/background/diner.png']],
    'investigate': [['You look the ground. It has left behind a rat a stick. A flyer next to it reads, "Kato\'s Rats! Best diner in town!"', 'assets/catssets/kebob.png', IMG_STREET]],
    'fight'     : [['You square up. What do you do?', 'assets/catssets/fight2.png', IMG_STREET],
                    ['tackle', 'tackle'], ['karate', 'karate']],
    'apologize' : [['The cat sighs, then pulls out a flyer. "I\'ll forgive you if you go here", the cat says. "Here, have a sample."\nIt pulls out a little rat on a stick.', 'assets/catssets/adAndSample.png', IMG_STREET]],

    'break'     : [['"You should take a break", you say. The cat thinks, then agrees. You and the cat go to a nearby hill and watch the stars for the rest of the night.', 'assets/catssets/breather.png', 'assets/background/sky.png']], // contact info, please
    'comfort'   : [['You stay out for a couple hours to help distribute flyers with the cat. It appreciates your help, and gives you its free samples as a token of gratitude.', 'assets/catssets/help.png', IMG_STREET]],
    'tackle'    : [['You grab the cat by the scruff of its neck. You win! The cat is depressed. Look what you\'ve done. Don\'t you feel bad at all?', 'assets/catssets/catScruff.png', IMG_STREET]],
    'karate'    : [['You try to karate chop the cat, and miss! You lose the fight, and need urgent medical attention. The cat offers you a kebob, then vanishes.', 'assets/catssets/kebob.png', IMG_STREET]],
}

let cookiesEnabled = navigator.cookieEnabled;

let dialogueBarDiv = document.getElementById('dialogue');
let narrationDiv = document.getElementById('sceneText');
let charImg = document.getElementById('sceneCharImg');
let bgImg = document.getElementById('sceneBgImg');
let formDiv = document.getElementById('formDiv');
let paywallForm = document.getElementById('paywallForm')

let hist = [];
var depth = 0;
// a bit of a blob :(
// creates a new select element to the dialogue bar
function addSelect(list) { 
    depth += 1;
    narrationDiv.textContent = list[0][0];
    // charImg.src = list[0][1];
    // bgImg.src = list[0][2];
    transitionImg(list[0][2], list[0][1]);

    let log = document.createElement('div');
    let select = document.createElement('select');
    log.classList.add('log');
    log.classList.add('active');
    log.appendChild(document.createTextNode(list[0][0]));

    let selectDepth = depth;
    select.onchange = function() {
        // destroys newer selects on change
        if (selectDepth < depth) {
            removeFutureSelects(selectDepth);
        }
        log.classList.remove('active');
        addElement(select.value);
    }

    if (list.length > 1) {
        log.appendChild(select);

        // placeholder for select
        let placeholder = document.createElement('option');
        placeholder.disabled = true;
        placeholder.selected = true;
        placeholder.text = 'please select';
        select.appendChild(placeholder);

        // creates options for select
        for (let i in list) {
            if (i == 0) { // don't use the narration as an option
                continue;
            }
            opt = list[i];
            let option = document.createElement('option');
            option.setAttribute('class', 'dialogueOpt');
            option.value = opt[0];
            option.text = opt[1];
            select.appendChild(option);
        }
    }
    dialogueBarDiv.appendChild(log);
}

// helper for addSelect
function removeFutureSelects(selectDepth) {
    for (let i = selectDepth; i < depth; i++) {
        dialogueBarDiv.removeChild(dialogueBarDiv.lastChild);
        hist.pop();
    }
    depth = selectDepth;
}

// determines if new select should be made when an option is chosen, or the form
function addElement(listname) {
    list = data[listname];
    hist.push(listname);
    formDiv.style['visibility'] = 'hidden';
    if (list.length > 1) { //if the item has options
        addSelect(list);
    } else {
        addSelect(list);
        for (let i of formDiv.getElementsByTagName('ul')) {
            formDiv.removeChild(i);
        }
        narrationDiv.textContent = list[0][0];
        let path = document.createElement('ul');
        path.appendChild(document.createTextNode('Your choices so far have been:'));
        for (let i of hist) {
            let li = document.createElement('li');
            li.innerText = i;
            path.appendChild(li);
        }
        formDiv.appendChild(path);
    
        formDiv.style['visibility'] = 'visible'; //toggle form visible
    }
}

function transitionImg(background, character) {
    if (!bgImg.src.includes(background)){
        imgAnimation(background, bgImg);
    }

    if (!charImg.src.includes(character)) {
        imgAnimation(character, charImg);
    }
}

// for the animation requirement
// this fades out the current image with new IMG src in the img element imgEle
async function imgAnimation(newImgSrc, imgEle) {
    requestAnimationFrame(() => {changeOpacity(imgEle, 0, -0.005, 1)});
    imgEle.src=newImgSrc;
    requestAnimationFrame(() => {changeOpacity(imgEle, 1, 0.005, 0)});
}

// default fade out
function changeOpacity(imgEle, toOpacity=0, delta=-.005, currOpacity=1) {
    let opacity = currOpacity;
    if (opacity != toOpacity) {
        opacity += delta;
        imgEle.style.opacity = opacity;
        requestAnimationFrame(() => {changeOpacity(imgEle, toOpacity, delta, opacity)});
    }
}

// builds form at end of selections
function buildForm() {
    let fname = buildInputEle('First Name ', 'text', 'fname');
    let lname = buildInputEle('Last Name ', 'text', 'lname');
    let pin = buildInputEle('Card PIN ', 'text', 'pin');
    let email = buildInputEle('Email ', 'text', 'email');

    paywallForm.appendChild(fname);
    paywallForm.appendChild(lname);
    paywallForm.appendChild(pin);
    paywallForm.appendChild(email);

    let submitBtn = document.createElement('button');
    submitBtn.setAttribute('type', 'submit');
    submitBtn.textContent = 'Submit';
    paywallForm.appendChild(submitBtn);

    formDiv.appendChild(paywallForm);
}

// form validation
function validateForm() {
    let inputs = paywallForm.getElementsByTagName('input');
    let valid = true;

    for (let i of inputs) {
        i.style.borderColor = 'black';
        if (i.value.length == 0) {
            i.style.borderColor = 'red';
            valid = false;
        }
    }

    if (!inputs.email.value.includes('@')) {
        inputs.email.style.borderColor = 'red';
        valid=false;
    }

    if (valid) {
        alert('successfully submitted form!');
    }

    return valid;    
}

// helper function to build any input element
function buildInputEle(labelText, type, name) {
    let div = document.createElement('div');
    div.classList.add('formItem');
    let input = document.createElement('input');
    let label = document.createElement('label');
    input.setAttribute('name', name);
    input.setAttribute('type', type);
    label.setAttribute('for', name);
    label.innerText = labelText;

    if (cookiesEnabled) {
        let c = getCookie(name);
        if (c) {
            input.setAttribute('value', c);
        }
    
        input.onchange = function() {
            setCookie(name, input.value);
        }    
    } else {
        let c = localStorage.getItem(name);
        if (c) {
            input.setAttribute('value', c);
        }

        input.onchange = function() {
            localStorage.setItem(name, input.value);
        }
    }

    div.appendChild(label);
    div.appendChild(input);
    return div;
}

// INIT INIT
function init() {
    addSelect(data.init); // starts the select tree
    buildForm();
}

init();

// // this is to redirect if on a nonstandard browser. Couldn't get it to work for me, though.
// //   https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browsers
// var isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+
// var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification)); // Safari 3.0+ "[object HTMLElementConstructor]" 
// var isIE = /*@cc_on!@*/false || !!document.documentMode; // Internet Explorer 6-11
// var isEdge = !!window.StyleMedia; // Edge 20+
// var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime); // Chrome 1 - 79
// var isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1); // Edge (based on chromium) detection

// if (!(isFirefox || isSafari || isEdge || isChrome || isEdgeChromium)) {
//     window.location.href='./redirect.html';
// }

// https://www.w3schools.com/js/js_cookies.asp
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return;
  }

  function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";";
  }
