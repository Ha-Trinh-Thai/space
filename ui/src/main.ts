import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import vuetify from './plugins/vuetify';
import VueKonva from 'vue-konva';
import App from './App.vue';
import './styles/tailwind.css';
import './styles/main.scss';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);
app.use(VueKonva);

app.mount('#app');
