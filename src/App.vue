<template>
  <div id="app">
    <div class="prize-icon" >
      <div v-if="prize == 1">
        <img src="images/prizes/gold-prize.svg" width="250px">
      </div>
      <div v-else-if="prize == 2">
        <img src="images/prizes/silver-prize.svg" width="250px">
      </div>
      <div v-else-if="prize == 3">
        <img src="images/prizes/bronze-prize.svg" width="250px">
      </div>
      <div v-else>
        <img src="images/prizes/diamond-prize.svg" width="250px">
      </div>
    </div>
    <div class="main-screen">
      <div id="display">
        <h1 v-if="winners.length">
          <span class="name" v-for="winner in winners" v-bind:key="winner">{{ winner }}</span>
        </h1>
        <h1 v-else class="welcome">Vòng quay may mắn</h1>
      </div>
      <div id="control">
        <div class="input-player">
          <form @submit.prevent="setup">
            <p>
              <label>Nhập file danh sách:</label>
              <input type="file" @change="upload" :disabled="isSetup" ref="upload" />
            </p>
            <p>
              <label>
                Số người chơi：
                <input
                  type="number"
                  required
                  min="1"
                  max="999999"
                  v-model="total"
                  number
                  :disabled="isSetup"
                  ref="total"
                />
              </label>
              <button :disabled="isSetup">Đồng ý</button>
            </p>
          </form>
        </div>
        <div class="float-right">
          <form @reset="reset"></form>
          <p>
            <label>
              Số người trùng giải：
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
          <p>
            Người chơi còn lại：
            <span v-text="remaining"></span>
            <button type="reset" :disabled="!isSetup">Đặt lại</button>
          </p>
        </div>
        
        
        <form  @submit.prevent="draw">
          <p>
            <label>
              Số người trùng giải：
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
    <div class="winner-display">
      <WinnerDisplay v-bind:prizes="prizes"/>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import WinnerDisplay from "./components/WinnerDisplay";

export default {
  name: "app",
  components: {
    WinnerDisplay
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
      prize: null
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
    upload({ target }) {
      let file = target.files[0];

      if (!file) {
        return;
      }

      let reader = new FileReader();

      reader.onload = ({ target }) => {
        this.candidates = target.result
          .trim()
          .split("\n")
          .map(line => line.trim());
        this.total = this.candidates.length;

        let round = this.$refs.round;
        this.$nextTick(() => {
          round.focus();
        });
      };
      reader.readAsText(file);
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
      this.stopRoll();
      this.rollTimer = setInterval(() => {
        this.shuffle();
        this.winners = this.candidates.slice(0, this.round);
      }, 1000 / 15);

      this.isRolling = true;
    },
    stopRoll: function() {
      clearTimeout(this.rollTimer);
      
      if (this.prize == 1 && this.isRolling) {
        
        if (this.prizes.goldPrizes.length) {
          this.prizes.goldPrizes = this.prizes.goldPrizes.concat(this.winners)
        } 
        else {
          this.prizes.goldPrizes = this.winners
        }
        
      }

      if (this.prize == 2 && this.isRolling) {
        if (this.prizes.silverPrizes.length) {
          this.prizes.silverPrizes = this.prizes.silverPrizes.concat(this.winners);
        } else {
          this.prizes.silverPrizes = this.winners;
        }
        
      }

      if (this.prize == 3 && this.isRolling) {
        if (this.prizes.bronzePrizes.length) {
          this.prizes.bronzePrizes = this.prizes.bronzePrizes.concat(this.winners);
        } else {
          this.prizes.bronzePrizes = this.winners  
        }
        
      }

      if (this.prize == 4 && this.isRolling) {
        if (this.prizes.plusPrizes.length) {
          this.prizes.plusPrizes = this.prizes.plusPrizes.concat(this.winners);
        } else {
          this.prizes.plusPrizes = this.winners  
        }
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
  background: #4db1d3;
}

body {
  position: relative;
  margin: 0;
  font-size: 16px;
  font-family: 'Lobster', cursive;
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
  position: absolute;
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
  top: 525px;
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
  position: absolute;
  top: 10%;
  right: 10%;
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
</style>