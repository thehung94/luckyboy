import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

let app =new Vue({
  render: h => h(App),
}).$mount('#app')


window.onresize = App.fitDisplay;

window.onbeforeunload = () => {
    if (app.isSetup) {
        return 'Bạn có thực sự muốn đóng cửa số không ?';
    }
};