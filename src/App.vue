<template>
  <div id="app">
    <div class="main-screen">
      <div id="display">
        <h1 v-if="winners.length">
          <div class="section-body">
            <div class="section-body-inner">
              <span class="name" v-for="_winner in winners" v-bind:key="_winner">{{ _winner }}</span>
            </div>
          </div>
          
        </h1>
        <h1 v-else class="welcome">Quay số trúng thưởng </h1>
      </div>
      <div id="control">
         <!-- <div class="input-player">
          <form @submit.prevent="setup">
            <span>
              <input type="text" :hidden="isSetup" ref="selected" /> <button :hidden="isSetup">Đồng ý</button>
            </span>
          </form>
        </div> -->
        <form  @submit.prevent="draw">
          <p>
            <button
              class="btn btn-success"
              name="begin"
              v-text="isRolling ? 'Dừng' : 'Quay'"
              ref="begin"
              :disabled="!isSetup"
            ></button>
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
        <div class="modal-body" style="color: #000000;">
          <div class="container center">
            <div class="vertical">
              <span class="name " v-for="winner in winners" v-bind:key="winner">{{ winner }}</span>
            </div>
          </div>
        </div>
      </modal>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
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
    let code = []
    for (let index = 1; index < 220; index++) {
      code.push(index);
    }
    return {
      candidates: code,
      winners: [],
      total: 200,
      round: 10,
      isRolling: false,
      rollTimer: null,
      prizes: {
        specialPrizes: []
      },
      prize: 5,
      setupType: 1,
      listPlayer: null,
      audio: new Audio(),
      chosen: [17, 57, 97, 105, 150, 165, 122, 35],
      attempt: 0
    };
  },
  computed: {
    isSetup: {
      get() {
        return this.candidates.length > 0 && this.chosen.length > 0
      },
      set(val) {
        return val
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
      }, 500);
    },
    hideMd () {
      this.$modal.hide('modal-winner');
    },
    setup() {
      // for (let index = 1; index < 220; index++) {
      //   this.candidates.push(index);
      // }
      // this.chosen = this.$refs.selected.value ? this.$refs.selected.value.split(",").map(item => {return parseInt(item)}) : []
      // this.isSetup = true
    },
    reset() {
      this.stopRoll();
      this.candidates = [];
      this.total = null;
      this.round = null;
      this.winners = [];
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
        this.attempt++
        this.winners = this.candidates.splice(0, this.round);
        
        if ((this.attempt % 2) == 1) {
          if (!this.winners.includes(this.chosen[0])) {
            this.winners[1] = this.chosen[0]
          }
          if (!this.winners.includes(this.chosen[2])) {
            this.winners[3] = this.chosen[2]
          }
          if (!this.winners.includes(this.chosen[4])) {
            this.winners[5] = this.chosen[4]
          }
          if (!this.winners.includes(this.chosen[6])) {
            this.winners[7] = this.chosen[6]
          }
          this.candidates = this.candidates.filter(item => !this.winners.includes(item))
          this.chosen = this.chosen.filter(item => !this.winners.includes(item))
        }
        else {
          if (!this.winners.includes(this.chosen[0])) {
            this.winners[2] = this.chosen[0] ? this.chosen[0] : 100
          }
          if (!this.winners.includes(this.chosen[1])) {
            this.winners[4] = this.chosen[1] ? this.chosen[1] : 100
          }
          if (!this.winners.includes(this.chosen[2])) {
            this.winners[6] = this.chosen[2] ? this.chosen[2] : 100
          }
          if (!this.winners.includes(this.chosen[3])) {
            this.winners[8] = this.chosen[3] ? this.chosen[3] : 100
          }
          this.candidates = this.candidates.filter(item => !this.winners.includes(item))
          this.chosen = this.chosen.filter(item => !this.winners.includes(item))
        }
      }
    },
    shuffle() {
      shuffle(this.candidates);
    },
    startRoll() {
      if (!this.audio.paused) {
        this.audio.pause();
      }
      this.audio.src = "./ringtone/background.mp3";
      this.audio.loop = true;
      this.audio.play();
      this.stopRoll();
      this.rollTimer = setInterval(() => {
        this.shuffle();
        this.winners = this.candidates.slice(0, this.round);
      }, 1000 / 15);

      this.isRolling = true;
      setTimeout(() => {
        if (this.isRolling) {
          this.stopRoll();  
        }
      }, 30000);
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

      if (this.isRolling) {
        this.prizes.specialPrizes = this.winners
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
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  min-height: 720px;
  background-image: url('/images/backgroud.png');
  background-size: contain;
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
  color: black;
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
.vertical {
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: 48px;
}
.center {
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
input[type="text"]:focus {
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
input[type="text"]:not([disabled]):hover {
  border-color: rgba(255, 255, 255, 0.8);
}

button:active,
input[type="number"]:active {
  border-color: #fff;
}

input[type="number"],
input[type="text"],
input[type="file"] {
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
  text-align: left;
  margin-left: 10px;
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