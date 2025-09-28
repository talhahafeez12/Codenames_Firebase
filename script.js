const firebaseConfig = {
  databaseURL: "https://codenames-d694e-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

var global_user_id = "";
var global_user_status = "";
var global_user_turn = "red";
var global_user_team = "";
var global_game_id = "";


function new_game_id() {
    var game_id = "";
    while (game_id == "") {
        game_id = window.prompt("Please Enter New Game Id:");
    }
    const gameRef = db.ref(`games/${game_id}`);
    gameRef.once("value").then((snapshot) => {
        if (!snapshot.exists()) {
            global_game_id = game_id;
            document.getElementById("dup_game_button").style.display = "block";
            document.getElementById("new_game_button").style.display = "none";
            new_game(game_id);

            db.ref(`games/${game_id}`).on('value', (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    if (data['currentTurn'] == 'red') {
                        document.getElementById('current_turn').innerText = 'Current Turn: Red';
                        global_user_turn = 'red';
                    } else {
                        document.getElementById('current_turn').innerText = 'Current Turn: Blue';
                        global_user_turn = 'blue';
                    }   
                }
            });

        } else {
            window.alert("Please enter a different Game Id.")
            new_game_id();
        }
    });
}

function new_game() {
    document.getElementsByClassName("game")[0].style.display = "flex";
    const words = [
        "apple", "river", "doctor", "moon", "bottle", "guitar", "train", "paper", "storm", "chair",
        "pencil", "garden", "king", "castle", "radio", "planet", "bridge", "tiger", "queen", "desert",
        "mountain", "snow", "camera", "map", "island", "cookie", "hammer", "school", "cave", "book",
        "fire", "song", "eagle", "web", "circus", "dance", "crown", "glove", "pilot", "star",
        "ocean", "cliff", "ice", "boat", "bell", "robot", "witch", "milk", "rocket", "mirror",
        "cloud", "lantern", "sword", "tree", "coin", "needle", "forest", "pillow", "shelf", "shark",
        "fence", "beach", "cup", "rope", "carpet", "tunnel", "ship", "dust", "feather", "tent",
        "pearl", "broom", "helmet", "ladder", "hook", "maze", "globe", "fountain", "whistle", "brick",
        "flame", "basket", "statue", "drum", "mask", "scroll", "twig", "ring",
        "jump", "run", "slide", "climb", "swim", "crawl", "fly", "bounce", "dig", "throw",
        "drive", "ride", "sail", "cook", "paint", "draw", "catch", "kick", "push", "pull",
        "grow", "walk", "dance", "sing", "hide", "seek", "build", "break", "play", "watch",
        "write", "read", "shine", "open", "close", "float", "sink", "sweep", "clean", "fix",
        "spin", "cheer", "laugh", "yell", "plan", "plant", "blink", "snore", "glow", "grin",
        "fast", "slow", "cold", "hot", "bright", "dark", "loud", "quiet", "strong", "weak",
        "old", "young", "soft", "hard", "happy", "sad", "tall", "short", "wide", "narrow",
        "thick", "thin", "rich", "poor", "brave", "shy", "kind", "mean", "smart", "funny",
        "clean", "dirty", "wet", "dry", "rough", "smooth", "deep", "shallow", "round", "flat",
        "sharp", "blunt", "warm", "cool", "silly", "wise", "calm", "wild", "polite", "gentle"
    ];

    var board_var = [];
    var checked_words = [];
    while (true) {
        const randomIndex = Math.floor(Math.random() * words.length);
        if (!(words[randomIndex] in checked_words)) {
            board_var.push({'word': words[randomIndex], 'color': 'white', 'revealed': false});
            checked_words.push(words[randomIndex]);
        }
        if (board_var.length == 25) {
            break;
        }
    }

    // Get Red, Blue, and Black Words
    var red = 1;
    var blue = 1;
    var black = 1;
    while (true) {
        const randomIndex = Math.floor(Math.random() * 25);
        if (board_var[randomIndex].color == "white") {
            if (red <= 9) {
                board_var[randomIndex].color = "red";
                red += 1;
            }else if (red > 9 && blue <= 8) {
                board_var[randomIndex].color = "blue";
                blue += 1;
            } else {
                board_var[randomIndex].color = "black";
                black += 1;
            }
        }

        if (red > 9 && blue > 8 && black > 1) {
            break;
        }
    }

    var row = 1;
    var col = 1;

    for (var i = 0; i < board_var.length; i++) {
        document.getElementById("col_" + row + col).innerText = board_var[i].word;
        col += 1;
        if (col > 5) {
            col = 1;
            row += 1;
        }
    }

    document.getElementById("join_game_button").style.display = "none";
    document.getElementById('current_turn').style.display = 'block';
    const gameRef = db.ref(`games/${global_game_id}`);
    gameRef.set({
        board: board_var,
        currentTurn: "red",
        revealedWords: [],
    });
    db.ref(`games/${global_game_id}/board/0/word`).on('value', () => {
        db.ref(`games/${global_game_id}/board`).once('value', (snapshot1) => {
            var full_board = snapshot1.val();
            var row = 1;
            var col = 1;
            for (let i = 0; i < full_board.length; i++) {
                document.getElementById("col_" + row + col).innerText = full_board[i].word;
                col += 1;
                if (col > 5) {
                    col = 1;
                    row += 1;
                }
            }
        })
    });
    db.ref(`games/${global_game_id}/teams`).on('value', (snapshot) => {
        var data = snapshot.val();
        if (data && 'red' in data) {
            document.getElementById("red_players").innerHTML = "";
            if ('operatives' in data['red']) {
                var all_operatives = Object.keys(data['red']['operatives']);
                for (let i = 0; i < all_operatives.length; i++) {
                    const h4Element = document.createElement("h4");
                    h4Element.textContent = all_operatives[i];
                    document.getElementById("red_players").appendChild(h4Element);
                }
            } else if ('spymaster' in data['red']) {
                const h4Element = document.createElement("h4");
                h4Element.textContent = data['red']['spymaster']['id'];
                document.getElementById("red_players").appendChild(h4Element);
            }
        } 
        
        if (data && 'blue' in data) {
            document.getElementById("blue_players").innerHTML = "";
            if ('operatives' in data['blue']) {
                var all_operatives = Object.keys(data['blue']['operatives']);
                for (let i = 0; i < all_operatives.length; i++) {
                    const h4Element = document.createElement("h4");
                    h4Element.textContent = all_operatives[i];
                    document.getElementById("blue_players").appendChild(h4Element);
                }
            } else if ('spymaster' in data['blue']) {
                const h4Element = document.createElement("h4");
                h4Element.textContent = data['blue']['spymaster']['id'];
                document.getElementById("blue_players").appendChild(h4Element);
            }
        }
    });
    db.ref(`games/${global_game_id}/board`).on('value', (snapshot) => {
        var full_board = snapshot.val();
        for (let i = 0; i < full_board.length; i++) {
            if (full_board[i].revealed) {
                var word_row = Math.floor(i / 5) + 1;
                var word_col = (i % 5) + 1;
                var word_id = ("col_" + word_row) + word_col;
                document.getElementById(word_id).style.backgroundColor = full_board[i].color;
            }
        }
    });
}

function join_team_red() {
    var user_id = "";
    while (user_id == "") {
        user_id = window.prompt("Please enter your username:");
    }
    global_user_id = user_id;

    var gameRef = db.ref(`games/${global_game_id}/teams/red/operatives/${user_id}`);
    gameRef.push("");
    document.getElementById("join_team_red").style.display = "none";
    document.getElementById("join_team_blue").style.display = "none";
    global_user_status = "operative";
    global_user_team = "red";

    const userRef = db.ref(`games/${global_game_id}/teams/red/spymaster`); 
    userRef.once("value").then((snapshot) => {
        if (!snapshot.exists()) {
            document.getElementById("be_spy_master_red").style.display = "block";
        }
    });
}

function join_team_blue() {
    var user_id = "";
    while (user_id == "") {
        user_id = window.prompt("Please enter your username:");
    }
    global_user_id = user_id;
    global_user_status = "operative";
    global_user_team = "blue";
    var gameRef = db.ref(`games/${global_game_id}/teams/blue/operatives/${user_id}`);
    gameRef.push("");
    document.getElementById("join_team_blue").style.display = "none";
    document.getElementById("join_team_red").style.display = "none";

    const userRef = db.ref(`games/${global_game_id}/teams/blue/spymaster`); 
    userRef.once("value").then((snapshot) => {
        if (!snapshot.exists()) {
            document.getElementById("be_spy_master_blue").style.display = "block";
        }
    });
    
}

function be_red_spymaster() {
    const userRef = db.ref(`games/${global_game_id}/teams/red/spymaster`); 
    userRef.once("value").then((snapshot) => {
        if (!snapshot.exists()) { 
            const spyRef = db.ref(`games/${global_game_id}/teams/red/spymaster`);
            spyRef.set({id: global_user_id});
            db.ref(`games/${global_game_id}/teams/red/operatives/${global_user_id}`).remove();
        }
    });
    global_user_status = "spymaster";
    document.getElementById("be_spy_master_red").style.display = "none";
    show_board_spymaster();
}

function be_blue_spymaster() {
    const userRef = db.ref(`games/${global_game_id}/teams/blue/spymaster`); 
    userRef.once("value").then((snapshot) => {
        if (!snapshot.exists()) {
            const spyRef = db.ref(`games/${global_game_id}/teams/blue/spymaster`);
            spyRef.set({id: global_user_id});
            db.ref(`games/${global_game_id}/teams/blue/operatives/${global_user_id}`).remove();
        }
    });
    global_user_status = "spymaster";
    document.getElementById("be_spy_master_blue").style.display = "none";
    show_board_spymaster();
}

function show_board_spymaster() {
    const boardRef = db.ref(`games/${global_game_id}/board`);
    boardRef.once("value").then((snapshot) => {
        var board = snapshot.val();
        for (let i = 0; i < board.length; i++) {
            var row_index = Math.floor(i / 5) + 1;
            var col_index = i - (row_index - 1) * 5 + 1;
            var word_id = "col_" + row_index + col_index;
            document.getElementById(word_id).style.backgroundColor = board[i]['color'];
            if (board[i]['revealed'] == "true") {
                document.getElementById(word_id).style.color = "gray";
            }
        }
    });
}

function join_game() {
    var game_id = "";
    while (game_id == "") {
        game_id = window.prompt("Please enter game Id:");
    }
    const gameRef = db.ref(`games/${game_id}`);
    gameRef.once("value").then((snapshot) => {
        if (!snapshot.exists()) {
            window.alert("Enter Valid Game Id");
            join_game();
        } else {
            global_game_id = game_id;
            db.ref(`games/${game_id}`).on('value', (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    if (data['currentTurn'] == 'red') {
                        document.getElementById('current_turn').innerText = 'Current Turn: Red';
                        global_user_turn = 'red';
                    } else {
                        document.getElementById('current_turn').innerText = 'Current Turn: Blue';
                        global_user_turn = 'blue';
                    }   
                }
            });
            set_old_game(snapshot.val());
        }
    });
}

function set_old_game(old_game) {        
    // Set Old Board
    var row = 1;
    var col = 1;
    for (let i = 0; i < old_game['board'].length; i++) {
        document.getElementById("col_" + row + col).innerText = old_game['board'][i].word;
        col += 1;
        if (col > 5) {
            col = 1;
            row += 1;
        }
    }

    document.getElementById("dup_game_button").style.display = "block";
    document.getElementById("new_game_button").style.display = "none";
    document.getElementById("join_game_button").style.display = "none";
    document.getElementsByClassName("game")[0].style.display = "flex";
    document.getElementById('current_turn').style.display = 'block';

    // Set Old Team
    if ("teams" in old_game) {
        if ("red" in old_game["teams"]) {
            if ("operatives" in old_game["teams"]["red"]) {
                for (let i = 0; i < Object.keys(old_game["teams"]["red"]["operatives"]).length; i++) {
                    const h4Element = document.createElement("h4");
                    h4Element.textContent = Object.keys(old_game["teams"]['red']['operatives'])[i];
                    document.getElementById("red_players").appendChild(h4Element);
                }
            }
            if ("spymaster" in old_game["teams"]["red"]) {
                const h4Element = document.createElement("h4");
                h4Element.textContent = old_game["teams"]['red']['spymaster']['id'];
                document.getElementById("red_players").appendChild(h4Element);
            }
        }

        if ("blue" in old_game["teams"]) {
            if ("operatives" in old_game["teams"]["blue"]) {
                for (let i = 0; i < Object.keys(old_game["teams"]["blue"]["operatives"]).length; i++) {
                    const h4Element = document.createElement("h4");
                    h4Element.textContent = Object.keys(old_game["teams"]['blue']['operatives'])[i];
                    document.getElementById("blue_players").appendChild(h4Element);
                }
            }
            if ("spymaster" in old_game["teams"]["blue"]) {
                const h4Element = document.createElement("h4");
                h4Element.textContent = old_game["teams"]['blue']['spymaster']['id'];
                document.getElementById("blue_players").appendChild(h4Element);
            }
        }
    }

    // Set Team Turn
    global_user_turn = old_game["currentTurn"];
    db.ref(`games/${global_game_id}/board/0/word`).on('value', (snapshot) => {
        db.ref(`games/${global_game_id}/board`).once('value', (snapshot1) => {
            var full_board = snapshot1.val();
            var row = 1;
            var col = 1;
            for (let i = 0; i < full_board.length; i++) {
                document.getElementById("col_" + row + col).innerText = full_board[i].word;
                col += 1;
                if (col > 5) {
                    col = 1;
                    row += 1;
                }
            }
        })
    });
    db.ref(`games/${global_game_id}/teams`).on('value', (snapshot) => {
        var data = snapshot.val();
        if (data && 'red' in data) {
            document.getElementById("red_players").innerHTML = "";
            if ('operatives' in data['red']) {
                var all_operatives = Object.keys(data['red']['operatives']);
                for (let i = 0; i < all_operatives.length; i++) {
                    const h4Element = document.createElement("h4");
                    h4Element.textContent = all_operatives[i];
                    document.getElementById("red_players").appendChild(h4Element);
                }
            } else if ('spymaster' in data['red']) {
                const h4Element = document.createElement("h4");
                h4Element.textContent = data['red']['spymaster']['id'];
                document.getElementById("red_players").appendChild(h4Element);
            }
        }
        if (data && 'blue' in data) {
            document.getElementById("blue_players").innerHTML = "";
            if ('operatives' in data['blue']) {
                var all_operatives = Object.keys(data['blue']['operatives']);
                for (let i = 0; i < all_operatives.length; i++) {
                    const h4Element = document.createElement("h4");
                    h4Element.textContent = all_operatives[i];
                    document.getElementById("blue_players").appendChild(h4Element);
                }
            } else if ('spymaster' in data['blue']) {
                const h4Element = document.createElement("h4");
                h4Element.textContent = data['blue']['spymaster']['id'];
                document.getElementById("blue_players").appendChild(h4Element);
            }
        }
    });
    db.ref(`games/${global_game_id}/board`).on('value', (snapshot) => {
        var full_board = snapshot.val();
        for (let i = 0; i < full_board.length; i++) {
            if (full_board[i].revealed) {
                var word_row = Math.floor(i / 5) + 1;
                var word_col = (i % 5) + 1;
                var word_id = ("col_" + word_row) + word_col;
                document.getElementById(word_id).style.backgroundColor = full_board[i].color;
            }
        }
    });
}

function word_click(id) {
    // Check if global_user_id is the same as who's team's turn it is.
    if (global_user_team == global_user_turn && global_user_status != "spymaster") {
        // Check what color is the word
        var word_color;
        var word_text = document.getElementById(id).innerText;
        var word_index = (5 * (parseInt(id.split("_")[1][0]) - 1)) + parseInt(id.split("_")[1][1]) - 1;
        let wordRef = db.ref(`games/${global_game_id}/board/${word_index}`); 
        wordRef.once("value").then((snapshot) => {
            word_color = snapshot.val()['color'];
            const revWordRef = db.ref(`games/${global_game_id}/revealedWords/${word_text}`);
            revWordRef.once("value").then((snapshot) => {
                if (!snapshot.exists()) {
                    document.getElementById(id).style.backgroundColor = word_color;
                    wordRef.update({ revealed: true });
                    revWordRef.push(id);
                    if (word_color != global_user_team) {
                        if (global_user_team == "red") {
                            global_user_turn = "blue";
                            db.ref(`games/${global_game_id}`).update({ currentTurn: "blue"});
                        } else {
                            global_user_turn = "red";
                            db.ref(`games/${global_game_id}`).update({ currentTurn: "red"});
                        }
                    }
                    return;
                } else {
                    return;
                }
            });
        });
        
    }
}

document.getElementById("new_game_button").addEventListener("click", new_game_id);
document.getElementById("dup_game_button").addEventListener("click", new_game);
document.getElementById("join_team_red").addEventListener("click", join_team_red);
document.getElementById("join_team_blue").addEventListener("click", join_team_blue);
document.getElementById("be_spy_master_red").addEventListener("click", be_red_spymaster);
document.getElementById("be_spy_master_blue").addEventListener("click", be_blue_spymaster);
document.getElementById("join_game_button").addEventListener("click", join_game);
const all_cards = document.getElementsByClassName("card");
for (let i = 0; i < all_cards.length; i++) {
    all_cards[i].addEventListener("click", function() {
        word_click(all_cards[i].id);
    });
};