<template>
  <div id="app">
    <div class="main-screen">
      <div id="display">
        <h1 v-if="winners.length">
          <div class="section-body">
            <div class="section-body-inner">
              <span class="name" v-for="winner in winners" v-bind:key="winner">{{ winner }}</span>
            </div>
          </div>
          
        </h1>
        <h1 v-else class="welcome">Quay số trúng thưởng </h1>
      </div>
      <div id="control">
        <div class="input-player">
          <form @submit.prevent="setup" @reset="reset">
            <p>
              <input type="file" @change="upload" :disabled="isSetup" ref="upload" />
            </p>
            <p>
              <button type="reset" :disabled="!isSetup">Đặt lại</button>
              <button :disabled="isSetup">Đồng ý</button>
            </p>
          </form>
          <form >
              
          </form>
        </div>
        <div class="float-right">
           <p>
              Người chơi còn lại：
              <span v-text="remaining"></span>
            </p>
        </div>
        
        
        <form  @submit.prevent="draw">
          <p>
            <label>
              Số người trúng giải：
              <input
                type="number"
                v-model="round"
                number
                required
                :disabled="!this.isSetup || this.isRolling"
                min="1"
                max="10"
                @input="checkRemaining"
                ref="round"
              />
            </label>
            <button
              class="btn btn-success"
              :disabled="!isSetup"
              name="begin"
              v-text="isRolling ? 'Dừng' : 'Quay'"
              ref="begin"
            ></button>
          </p>
          <p class="form-group">
            Chọn giải thưởng
            <select class="form-control" name="prize" v-model="prize" required>
              <option value="1">Giải nhất</option>
              <option value="2">Giải nhì</option>
              <option value="3">Giải ba</option>
              <option value="4">Giải khuyến khích</option>
            </select>
          </p>
        </form>
      </div>
    </div>
    <div class="winner-display" style="background: #4db1d3" >
      <modal name="modal-winner" :scrollable="true" transition="pop-out">
        <div class="modal-header">
          <div class="modal-title">Danh sách trúng thưởng</div>
          <button id="btn-close-modal" v-on:click="hideMd">
            X
          </button>
        </div>
        <div class="modal-body" style="color: #000000">
            <table >
              <tr>
                <th>Mã dự thưởng</th>
                <th>Họ tên</th>
                <th>Chức danh</th>
                <th>Đơn vị công tác</th>
              </tr>
              <tr v-for="goldPrize in prizes.goldPrizes" v-bind:key="goldPrize"
                  :hidden="!prizes.goldPrizes || !prizes.goldPrizes.length || prize != 1"
                >
                <th>{{ goldPrize.Code }}</th>
                <th>{{ goldPrize.Name }}</th>
                <th>{{ goldPrize.Position }}</th>
                <th>{{ goldPrize.Company }}</th>
              </tr>

              <tr v-for="silverPrize in prizes.silverPrizes" v-bind:key="silverPrize"
                  :hidden="!prizes.silverPrizes || !prizes.silverPrizes.length || prize != 2"
                >
                <th>{{ silverPrize.Code }}</th>
                <th>{{ silverPrize.Name }}</th>
                <th>{{ silverPrize.Position }}</th>
                <th>{{ silverPrize.Company }}</th>
              </tr>

              <tr v-for="bronzePrize in prizes.bronzePrizes" v-bind:key="bronzePrize"
                  :hidden="!prizes.bronzePrizes || !prizes.bronzePrizes.length || prize != 3"
                >
                <th>{{ bronzePrize.Code }}</th>
                <th>{{ bronzePrize.Name }}</th>
                <th>{{ bronzePrize.Position }}</th>
                <th>{{ bronzePrize.Company }}</th>
              </tr>

              <tr v-for="plusPrize in prizes.plusPrizes" v-bind:key="plusPrize"
                  :hidden="!prizes.plusPrizes || !prizes.plusPrizes.length || prize != 4"
                >
                <th>{{ plusPrize.Code }}</th>
                <th>{{ plusPrize.Name }}</th>
                <th>{{ plusPrize.Position }}</th>
                <th>{{ plusPrize.Company }}</th>
              </tr>
            </table>
          </div>
      </modal>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import XLSX from 'xlsx';
import VModal from 'vue-js-modal';

Vue.use(VModal);
export default {
  name: "app",
  components: {
  },
  mounted() {
    this.playSound("./ringtone/background.mp3");
  },
  data: function() {
    return {
      candidates: [],
      winners: [],
      total: null,
      round: null,
      isRolling: false,
      rollTimer: null,
      prizes: {
        goldPrizes: [],
        silverPrizes: [],
        bronzePrizes: [],
        plusPrizes: [],
      },
      prize: null,
      setupType: 1,
      listPlayer: null,
      audio: new Audio()
    };
  },
  computed: {
    isSetup: {
      get() {
        return this.candidates.length > 0;
      }
    },
    remaining: {
      get() {
        if (!this.isSetup) {
          return "∞";
        }
        return this.candidates.length;
      }
    }
  },
  methods: {
    playSound (sound) {
      if(sound) {
        this.audio = new Audio(sound);
        this.audio.play();
      }
    },
    showMd () {
      setTimeout(() => {
        this.$modal.show('modal-winner');  
      this.$modal.show('modal-winner');
        this.$modal.show('modal-winner');  
      }, 500);
    },
    hideMd () {
      this.$modal.hide('modal-winner');
    },
    setup() {
      if (this.$refs.total.validationMessage) {
        alert(this.$refs.total.validationMessage);
        return;
      }

      this.candidates = Array(parseInt(this.total))
        .fill(true)
        .map((item, i) => pad(i + 1, 3));
      let round = this.$refs.round;
      this.$nextTick(() => {
        round.focus();
      });
    },
    async upload({ target }) {
      this.setupType = 2;
      let file = target.files[0];

      if (!file) {
        return;
      }

      await parserXlsx(file, (players) => {
        for (let index = 0; index < players.length; index++) {
          if (players[index] && players[index].Code) {
             this.candidates.push(players[index].Code.toString());
          }
        }
        this.listPlayer = players;
        this.total = this.candidates.length;
      });
    },
    reset() {
      this.stopRoll();
      this.candidates = [];
      this.total = null;
      this.round = null;
      this.winners = [];
      this.$refs.upload.value = "";
    },
    checkRemaining({ target }) {
      let validity = "";
      if (this.candidates.length < this.round) {
        validity =
          "Số lượng người chơi nhiều hơn số lượng giải thưởng còn lại.";
      }

      target.setCustomValidity(validity);
    },
    draw() {
      if (!this.isRolling) {
        this.startRoll();

        let begin = this.$refs.begin;

        this.$nextTick(() => {
          begin.focus();
        });
      } else {
        this.stopRoll();
        this.winners = this.candidates.splice(0, this.round);
        this.checkRemaining({
          target: this.$refs.round
        });
      }
    },
    shuffle() {
      shuffle(this.candidates);
    },
    startRoll() {
      if (!this.audio.paused) {
        this.audio.pause();
      }

      
      this.audio.loop = true;
      this.audio.play();
      this.stopRoll();
      this.rollTimer = setInterval(() => {
        this.shuffle();
        this.winners = this.candidates.slice(0, this.round);
      }, 1000 / 15);

      this.isRolling = true;

      
      setTimeout(() => {
       
        this.stopRoll();
      }, 15000);
    },
    stopRoll: function() {
      clearTimeout(this.rollTimer);
      if (this.isRolling) {
        this.audio.pause();
        this.audio.src = './ringtone/sm-spin.mp3';
        this.audio.loop = false;
        this.audio.play();
        setTimeout(() => {
          this.audio.src = './ringtone/game-tada.mp3';
          this.audio.play();  
        }, 1000);
        
      }
        
      if (this.prize == 1 && this.isRolling) {
        if (this.setupType == 2) {
          for (let i = 0; i < this.listPlayer.length; i++) {
            for (let j = 0; j < this.winners.length; j++) {
              if (this.listPlayer[i].Code == this.winners[j]) {
                this.prizes.goldPrizes.push(this.listPlayer[i]);
              }
            }
          }
        }
        else {
          this.prizes.goldPrizes = this.winners
        }
      }

      if (this.prize == 2 && this.isRolling) {
        if (this.setupType == 2) {
          for (let i = 0; i < this.listPlayer.length; i++) {
            for (let j = 0; j < this.winners.length; j++) {
              if (this.listPlayer[i].Code == this.winners[j]) {
                this.prizes.silverPrizes.push(this.listPlayer[i]);
              }
            }
          }
        }
        else {
          this.prizes.silverPrizes = this.winners
        }
      }

      if (this.prize == 3 && this.isRolling) {
        if (this.setupType == 2) {
          for (let i = 0; i < this.listPlayer.length; i++) {
            for (let j = 0; j < this.winners.length; j++) {
              if (this.listPlayer[i].Code == this.winners[j]) {
                this.prizes.bronzePrizes.push(this.listPlayer[i]);
              }
            }
          }
        }
        else {
          this.prizes.bronzePrizes = this.winners
        }
      }

      if (this.prize == 4 && this.isRolling) {
        if (this.setupType == 2) {
          for (let i = 0; i < this.listPlayer.length; i++) {
            for (let j = 0; j < this.winners.length; j++) {
              if (this.listPlayer[i].Code == this.winners[j]) {
                this.prizes.plusPrizes.push(this.listPlayer[i]);
              }
            }
          }        
        }
        else {
          this.prizes.plusPrizes = this.winners
        }
      }
      if (this.isRolling) {
        this.showMd();
      }
      this.isRolling = false;
    }
  },
  watch: {
    winners(val, oldVal) {
      if (val == null || oldVal == null || val.length !== oldVal.length) {
        fitDisplay();
      }
    }
  }
};

function fitDisplay() {
  Vue.nextTick(() => {
    let display = document.getElementById("display");
    let content = document.querySelector("h1");
    content.style.fontSize = "";

    let computed;

    while (innerHeight <= outerHeight) {
      let outerHeight = display.offsetHeight;
      let innerHeight = content.offsetHeight;

      if (innerHeight > outerHeight) {
        computed = parseInt(window.getComputedStyle(content).fontSize, 10);
        if (computed === 12) {
          break;
        }

        content.style.fontSize = computed - 2 + "px";
      } else {
        break;
      }
    }
  });
}
/** HELPERS **/
function fixdata(data) {
	var o = "", l = 0, w = 10240;
	for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
	o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
	return o;
}

/** PARSING **/
async function parserXlsx(file, callback) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var results, 
          data = e.target.result, 
          fixedData = fixdata(data), 
          workbook=XLSX.read(btoa(fixedData), {type: 'base64'}), 
          firstSheetName = workbook.SheetNames[0], 
          worksheet = workbook.Sheets[firstSheetName];
      results=XLSX.utils.sheet_to_json(worksheet);
      callback(results);
    };
    reader.readAsArrayBuffer(file);
}

function swap(items, i, j) {
  let k = items[i];
  items[i] = items[j];
  items[j] = k;
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    swap(items, i, j);
  }
}

function pad(number, digits) {
  let numDigits = Math.floor(Math.log10(number)) + 1;
  if (numDigits >= digits) {
    return "" + number;
  }
  return (
    Array(digits - numDigits)
      .fill(0)
      .join("") + number
  );
}
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  min-height: 720px;
  background-image: url('/images/background1.jpg');
  background-size: cover;
}

body {
  /* background-image: url("/images/background1.jpg");
  background-repeat: no-repeat; */
  position: relative;
  margin: 0;
  font-size: 16px;
  font-family: 'UTM AvoBold';
  color: #fff;
}

p {
  margin: 0.75em 0;
}

p * {
  vertical-align: middle;
}

button,
input {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  vertical-align: middle;
}

button::-moz-focus-inner,
input::-moz-focus-inner {
  border: 0;
  padding: 0;
}

#display,
#control {
  width: 100%;
  text-align: center;
}

#display {
  position: relative;
  height: 230px;
  overflow: hidden;
  /* top: 200px; */
}

h1 {
  display: inline-block;
  margin: 0;
  max-width: 640px;
  font-size: 108px;
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

h1.welcome {
  font-size: 48px;
}

#control {
  position: fixed;
  bottom: 0px;
}

.name {
  display: inline-block;
  width: 3.5em;
  margin: 3px;
  background-color: rgba(0, 0, 0, 0.2);
  color: #fff;
  border-radius: 5px;
  padding: 0.1em;
  text-align: center;
  background: #f1c40f;
}

button,
input[type="number"] {
  margin: 0 5px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.2);
  padding: 0 20px;
  line-height: 2;
  border-radius: 6px;
  color: inherit;
}

button:focus,
input[type="number"]:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.8);
}

input[type="file"] {
  cursor: pointer;
}

input[type="file"]:focus {
  outline: none;
}

button:not([disabled]):hover,
input[type="number"]:not([disabled]):hover {
  border-color: rgba(255, 255, 255, 0.8);
}

button:active,
input[type="number"]:active {
  border-color: #fff;
}

input[type="number"],
input[type="file"] {
  width: 120px;
  box-shadow: none;
}

button {
  border: 4px solid rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.4);
  cursor: pointer;
}

[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

[v-show] {
  display: none;
}

input[type="file"] {
  margin: 0 5px;
}

input[type="file"]::-webkit-file-upload-button {
  margin: 0;
  width: 120px;
  border: 4px solid rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.4);
  cursor: pointer;
  padding: 0 20px;
  line-height: 2;
  border-radius: 6px;
  color: inherit;
}

input[type="file"]::-webkit-file-upload-button:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.8);
}

input[type="file"]:not([disabled]):hover::-webkit-file-upload-button {
  border-color: rgba(255, 255, 255, 0.8);
}

input[type="file"]::-webkit-file-upload-button:active {
  border-color: #fff;
}

.winner-display {
  text-align: center;
}

.prize-icon {
  text-align: center;
  margin: 18px 0 18px 0;
}

select {
  width: 150px;
  padding: 5px 35px 5px 5px;
  font-size: 16px;
  border: 1px solid #ffffff;
  background: #ffffff;
  height: 34px;
  border-radius: 8px;
}


/* CAUTION: Internet Explorer hackery ahead */


select::-ms-expand {
    display: none; /* Remove default arrow in Internet Explorer 10 and 11 */
}

/* Target Internet Explorer 9 to undo the custom arrow */
@media screen and (min-width:0\0) {
    select {
        background: none\9;
        padding: 5px\9;
    }
}
.input-player {
  position: absolute;
  float: left;
  text-align: left
}
.float-right {
  position: absolute;
  right: 10px;
  text-align: left;
}

#btn-close-modal {
  position: absolute;
  bottom: 5px;
  right: 10px;
  background: none;
  border: 0px;
  color: #000000;
}

.wd-list-item {
  font-size: 32px;
}
ul {
  list-style-type: none;
}
.section-body {
  background: #f39c0f;
  padding: 11px;
  border: 3px solid #f5db79;
  border-radius: 15px;
  display: inline-block;
  position: relative;
  top: -3px;
  margin-bottom: 37px;
  max-width: 100%;
}
.section-body-inner {
  padding: 0 4px;
  overflow: hidden;
  border-radius: 10px;
  margin: 0;
  outline: 0;
  box-sizing: border-box;
}

#display {
  top: 40vh;
}
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td, th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
  font-weight: 400;
}

tr:nth-child(even) {
  background-color: #dddddd;
}

.modal-header {
  background: #ffd211;
  border-bottom: 5px solid #fff31d;
  position: relative;
  padding: 18px 0 15px;
  text-align: center;
  font-size: 24px;
  color: #000000;
}

.v--modal-box.v--modal {
  width: 70% !important;
  height: 50% !important;
  position: absolute !important;
  top: 15% !important;
  left: 15% !important;
  min-height: 500px;
}

.modal-body {
  overflow-y: scroll;
}

</style>