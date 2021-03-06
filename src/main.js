import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Vuelidate from 'vuelidate'
import axios from 'axios';


import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';

import VueSocketIO from 'vue-socket.io';
import io from 'socket.io-client';



const user = store.state.auth.user;
if (user) {
  if(user.accessToken){
    axios.defaults.headers.common['x-access-token'] = user.accessToken;
    const socket = io('http://localhost:3000', {
      transports: ['websocket'],
      auth: {
        token: user.accessToken,
      },
      transportOptions: {
        polling: {
          extraHeaders: {
            'Authorization': user.accessToken,
            'x-access-token': user.accessToken,
          },
        },
      },
    });

    Vue.use(new VueSocketIO({
      debug: false,
      connection: socket,
      vuex: {
          store,
          actionPrefix: 'SOCKET_',
          mutationPrefix: 'SOCKET_'
      },
    }));
  }
}

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(Vuelidate);


axios.interceptors.response.use(
  (config) => {
  store.commit('hideLoader');
  return config;
  },
  (error)=> {
    if (error) {
      const originalRequest = error.config;
      if ((error.response.status === 401 ||error.response.status === 400) && !originalRequest._retry) {
          console.log(error.response,originalRequest,"error");
          originalRequest._retry = true;

          store.dispatch('ShowMessage',error.response.data.message);
          store.dispatch('LogOut');
          router.push('/sign-form/sign-in');
      }
      console.log(error.response," - error");
      
      store.commit('hideLoader');
      return Promise.reject(error);
    }
  });
  
axios.interceptors.request.use((config)=>{
    store.commit('showLoader');
    return config;
  },(error)=>{
    if(error){
      store.commit('showLoader');
      return Promise.reject(error);
    }
  });

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:3000/api/';


Vue.config.productionTip = false;



function capitalize(value) {
  if (!value) return ''
  value = value.toString();
  return value.charAt(0).toUpperCase() + value.slice(1)
}

Vue.filter('dateFormate',function(stringDate,key){
  if(key=="birthday"||!key){
    stringDate = new Date(stringDate);
    let newDate = `${stringDate.getDate()} ${capitalize(
      stringDate.toLocaleString("ru", {
        month: "long",
      })
    )}
    ${stringDate.getFullYear()}`;
    console.log(stringDate);
    return newDate;
  }
  else{
    return stringDate;
  }
});

Vue.filter('dateMessage',function(stringDate){
  let d = new Date(stringDate);
  let month = String(d.getMonth() + 1).length<2?'0' + d.getMonth():d.getMonth();
  let day = String(d.getDate()).length<2?'0' + d.getDate() :d.getDate();
  const year = String(d.getFullYear());

  return `${day}/${month}/${year} ${d.getHours()}:${d.getMinutes()}`;
});

Vue.filter('capitalize', function (value) {
  return capitalize(value);
})



new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
