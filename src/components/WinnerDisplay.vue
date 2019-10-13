<template>
  <div class="winner-display">
    <div class="wd-title">
      <p>Người chiến thắng</p>
    </div>
    <div class="wd-list wd-gold-prize" :hidden="!prizes.goldPrizes || !prizes.goldPrizes.length">
      <p>Giải nhất</p>
      <ol class="wd-list-group">
        <div class="wd-list-item">
          <li v-for="goldPrize in prizes.goldPrizes" v-bind:key="goldPrize">{{ goldPrize }}</li>
        </div>
      </ol>
    </div>
    <div class="wd-list wd-silver-prize" :hidden="!prizes.silverPrizes || !prizes.silverPrizes.length">
      <p>Giải nhì</p>
      <ol class="wd-list-group">
        <div class="wd-list-item">
          <li v-for="goldPrize in prizes.goldPrizes" v-bind:key="goldPrize">{{ goldPrize }}</li>
        </div>
      </ol>
    </div>
    <div class="wd-list wd-bronze-prize" :hidden="!prizes.bronzePrizes || !prizes.bronzePrizes.length">
      <p>Giải ba</p>
      <ol class="wd-list-group">
        <div class="wd-list-item">
          <li v-for="goldPrize in prizes.goldPrizes" v-bind:key="goldPrize">{{ goldPrize }}</li>
        </div>
      </ol>
    </div>
    <div class="wd-list wd-plus-prize" :hidden="!prizes.plusPrizes || !prizes.plusPrizes.length">
      <p>Giải khuyến khích</p>
      <ol class="wd-list-group">
        <div class="wd-list-item">
          <li v-for="goldPrize in prizes.goldPrizes" v-bind:key="goldPrize">{{ goldPrize }}</li>
        </div>
      </ol>
    </div>
  </div>
</template>

<script>
export default {
  name: "WinnerDisplay",
  props: {
    prizes: {
      goldPrizes: [],
      silverPrizes: [],
      bronzePrizes: [],
      plusPrizes: []
    }
  },
  computed: {
      isConsole: {
          get() {
              return true;
          }
      }
  }
};
</script>

<style scoped>
</style>