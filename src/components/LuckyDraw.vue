<template>
  <div>
    <div id="display">
      <h1 v-if="winners.length">
        <span class="name" v-for="winner in winners" v-bind:key="winner">{{ winner }}</span>
      </h1>
      <h1 v-else class="welcome">Vòng quay may mắn?</h1>
    </div>
    <div id="control">
      <form @submit.prevent="setup">
        <p>
          <label>Nhập file danh sách:</label>
          <input type="file" @change="upload" :disable="isSetup" ref="upload" />
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
      <form @reset="reset" @submit.prevent="draw">
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
            :disabled="!isSetup"
            name="begin"
            v-text="isRolling ? 'Dừng' : 'Quay'"
            ref="begin"
          ></button>
        </p>
        <p>
          Người chơi còn lại：
          <span v-text="remaining"></span>
          <button type="reset" :disabled="!isSetup">Đặt lại</button>
        </p>
      </form>
    </div>
  </div>
</template>

<script>

export default {
  name: "LuckyDraw",
  props: {
      
  },
  data: function() {
    return {
      candidates: [],
      winners: [],
      total: null,
      round: null,
      isRolling: false,
      rollTimer: null
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
        this.candidates = target.result.split("\n").map(line => line.trim);
        this.total = this.candidates.length;
        // console.log("candidates lenght: ", this.total);

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
// var Vue = require('vue');
function fitDisplay() {
  this.nextTick(() => {
    let display = document.getElementById("display");
    let content = document.querySelector("h1");
    content.style.fontSize = "";

    let computed;

      let outerHeight = display.offsetHeight;
      let innerHeight = content.offsetHeight;

      if (innerHeight > outerHeight) {
        computed = parseInt(window.getComputedStyle(content).fontSize, 10);
        if (computed === 12) {
          return;
        }

        content.style.fontSize = computed - 2 + "px";
      }
  });
}

window.onresize = fitDisplay;

// window.onbeforeunload = () => {
//     if (app.isSetup) {
//         return 'Bạn có thực sự muốn đóng cửa số không ?';
//     }
// };

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

</style>