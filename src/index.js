import {
    GlobalView,
    RandomDataset,
} from "global-view";

const plot = new GlobalView(document.querySelector('#app'), null);
const data = new RandomDataset(1000, 3, (dataset) => plot.load(dataset, 0, 1, 2, 2));

