/* === LOGIN SYSTEM === */
const SESSION_LIMIT = 5 * 60 * 1000; // 5 menit

function register(){
  let user = document.getElementById("reg-username").value.trim();
  let pass = document.getElementById("reg-password").value.trim();
  if(!user || !pass){ setMsg("Isi username & password!"); return; }
  if(localStorage.getItem("rpgUser_"+user)){
    setMsg("❌ Username sudah dipakai!");
    return;
  }
  localStorage.setItem("rpgUser_"+user, JSON.stringify({username:user, password:pass}));
  setMsg("✅ Akun berhasil dibuat! Silakan login.");
}

function login(){
  let user = document.getElementById("login-username").value.trim();
  let pass = document.getElementById("login-password").value.trim();
  let data = localStorage.getItem("rpgUser_"+user);
  if(!data){ setMsg("❌ Akun tidak ditemukan!"); return; }
  let acc = JSON.parse(data);
  if(acc.password !== pass){ setMsg("❌ Password salah!"); return; }

  localStorage.setItem("rpgCurrentUser", user);
  localStorage.setItem("rpgExpire", Date.now() + SESSION_LIMIT);
  showGamePage();
}

function autoLogin(){
  let user = localStorage.getItem("rpgCurrentUser");
  let expire = localStorage.getItem("rpgExpire");
  if(user && expire && Date.now() < parseInt(expire)){
    showGamePage();
  } else {
    logout();
  }
}

function logout(){
  localStorage.removeItem("rpgCurrentUser");
  localStorage.removeItem("rpgExpire");
  document.getElementById("game-page").style.display="none";
  document.getElementById("login-page").style.display="block";
}

function setMsg(txt){ document.getElementById("login-msg").innerText = txt; }
function showGamePage(){
  document.getElementById("login-page").style.display="none";
  document.getElementById("game-page").style.display="block";
  updateStatus();
}

window.onload = autoLogin;

/* === GAME SYSTEM === */
let player = {
  name: "Hero",
  level: 1,
  hp: 100,
  maxHp: 100,
  gold: 50,
  exp: 0,
  expToNext: 50,
  weapon: {name: "Tangan Kosong", atk: 5, durability: Infinity, rarity:"common"},
  armor: "Cloth",
  inventory: [],
  defending: false,
  baseAttack: 10
};
let party = [];
let enemy = null;
let specialCooldown = false;
let playerTurn = true;

/* MONSTER & SHOP */
const locations = {
  forest: [
    {name: "Goblin", hp: 30, atk: 5, gold: 10, exp: 5},
    {name: "Wolf", hp: 40, atk: 7, gold: 12, exp: 6},
    {name: "Treant", hp: 60, atk: 10, gold: 20, exp: 10}
  ]
};
const shopItems = [
  {name: "Potion", type:"potion", effect:30, price: 15},
  {name: "Iron Sword", type:"weapon", atk:5, price: 30, durability: 10, rarity:"common"},
  {name: "Steel Sword", type:"weapon", atk:10, price: 80, durability: 20, rarity:"rare"},
  {name: "Epic Sword", type:"weapon", atk:20, price: 200, durability: 40, rarity:"epic"}
];

/* SAVE & LOAD */
function saveGame(){
  let saveData = {player, party, inventory: player.inventory};
  localStorage.setItem("rpgSave", JSON.stringify(saveData));
  log("💾 Game berhasil disimpan!");
}
function loadGame(){
  let data = localStorage.getItem("rpgSave");
  if(data){
    let saveData = JSON.parse(data);
    player = saveData.player;
    party = saveData.party || [];
    player.inventory = saveData.inventory || [];
    log("📂 Game berhasil dimuat!");
    updateStatus(); renderInventory();
  } else log("❌ Tidak ada save data!");
}

/* PARTY */
function recruitMember(name,hp,atk){
  if(party.length>=2){ log("❌ Party sudah penuh!"); return; }
  let member={name,hp,maxHp:hp,atk};
  party.push(member);
  log(`🤝 ${name} bergabung ke party!`); updateStatus();
}
function removeDeadMembers(){ party=party.filter(m=>m.hp>0); }

/* STATUS & LOG */
function updateStatus(){
  let statusHtml=`❤️ HP: ${player.hp}/${player.maxHp} | 💰 Gold: ${player.gold} | ⭐ EXP: ${player.exp}/${player.expToNext} | 🆙 Level: ${player.level}<br>`;
  statusHtml+=`⚔️ Weapon: <span class="rarity-${player.weapon.rarity}">${player.weapon.name}</span> (Atk+${player.weapon.atk}${player.weapon.durability!==Infinity?", Dur: "+player.weapon.durability:""})<br>`;
  if(party.length>0){
    statusHtml+=`<br>👥 Party:<br>`;
    party.forEach(m=>{
      let hpPercent=(m.hp/m.maxHp)*100;
      statusHtml+=`- ${m.name} (${m.hp}/${m.maxHp})<div class="bar-container"><div class="bar hp-player" style="width:${hpPercent}%;"></div></div>`;
    });
  }
  let hpPercent=(player.hp/player.maxHp)*100;
  statusHtml+=`<div class="bar-container"><div class="bar hp-player" style="width:${hpPercent}%;"></div></div>`;
  let expPercent=(player.exp/player.expToNext)*100;
  statusHtml+=`<div class="bar-container"><div class="bar exp-bar" style="width:${expPercent}%;"></div></div>`;
  if(enemy){
    let enemyHpPercent=(enemy.hp/enemy.maxHp)*100;
    statusHtml+=`<br>🐉 ${enemy.name} HP: ${enemy.hp}/${enemy.maxHp}<div class="bar-container"><div class="bar hp-enemy" style="width:${enemyHpPercent}%;"></div></div>`;
  }
  document.getElementById("status").innerHTML=statusHtml;
}
function log(msg){
  let logDiv=document.getElementById("log");
  logDiv.innerHTML+="<div>"+msg+"</div>";
  logDiv.scrollTop=logDiv.scrollHeight;
}

/* GAMEPLAY */
function explore(){ if(enemy){log("❌ Masih ada musuh!");return;}
  let monsters=locations.forest;
  enemy={...monsters[Math.floor(Math.random()*monsters.length)]};
  enemy.maxHp=enemy.hp; log(`🌲 Kamu bertemu ${enemy.name}!`); updateStatus();}
function attack(normal=true){ /* isi sama seperti sebelumnya */ }
function defend(){ /* isi sama */ }
function endPlayerTurn(){ /* isi sama */ }
function enemyTurn(){ /* isi sama */ }
function winBattle(){ /* isi sama */ }

/* INVENTORY */
function openInventory(){document.getElementById("inventory").style.display="block";renderInventory();}
function closeInventory(){document.getElementById("inventory").style.display="none";}
function renderInventory(){ /* isi sama */ }
function useItem(i,type,partyIndex=null){ /* isi sama */ }
function equipItem(i){ /* isi sama */ }

/* SHOP */
function openShop(){ /* isi sama */ }
function closeShop(){document.getElementById("shop").style.display="none";}
function buyItem(i){ /* isi sama */ }
function repairWeapon(cost,maxDur){ /* isi sama */ }
function getWeaponMaxDurability(name){ /* isi sama */ }

updateStatus();
