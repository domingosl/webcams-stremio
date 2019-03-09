#!/usr/bin/env node
const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const moment = require('moment');

const addon = new addonBuilder({
    id: 'org.dom.webcams',
    version: '1.0.0',

    name: 'Webcams',


    catalogs: [
        {
            type: 'tv',
            id: 'webcamtv',
            extra: [
                {
                    name: "genre",
                    options: [ "City", "Animals" ],
                    isRequired: false
                }
            ]
        }
    ],

    resources: ['catalog', 'stream', 'meta'],

    types: ['tv']
});

const dataset = [
    { id: 'moscowHD1', genre: "City", name: "Moscow", type: "tv", url: "https://videos3.earthcam.com/fecnetwork/moscowHD1.flv/chunklist_w1603680805.m3u8" },
    { id: '10874', genre: "City", name: "World Trade Center", type: "tv", url: "https://videos3.earthcam.com/fecnetwork/10874.flv/playlist.m3u8" },
    { id: '15489', genre: "Animals", name: "Utica, New York", description: "Monkey around with the Cotton Top Tamarins at Utica Zoo in New York with EarthCam's live streaming webcam", type: "tv", url: "https://videos3.earthcam.com/fecnetwork/15489.flv/chunklist_w1244049529.m3u8" }
];



addon.defineCatalogHandler(function(args, cb) {

    console.log("catalog call", args);

    const metas = dataset
        .filter(el => {

            if(typeof args.extra.genre === 'string' )
                return el.type === args.type && el.genre === args.extra.genre;
            else
                return el.type === args.type;

        })
        .map(el => generateMetaPreview(el));


    return Promise.resolve({ metas: metas })
});

addon.defineMetaHandler(function(args) {

    const metaObj = generateMetaPreview(dataset.find(el => el.type === args.type));
    console.log("META", args, metaObj);

    return Promise.resolve({ meta: metaObj })

});

addon.defineStreamHandler(function(args) {

    console.log("Stream request", args);

    const streams = dataset
        .filter( el => el.id === args.id)
        .map(s => {
            return s });


    return Promise.resolve({ streams: streams });

});


const generateMetaPreview = function(el) {

    const today = moment().subtract(1, 'days');

    const url = "https://www.earthcam.com/cams/includes/images/archivethumbs/network/" + el.id + "/" + today.format('YYYY') + "/" + today.format('MM') + "/" + today.format('DD') + "/" + today.format('HH') + ".jpg";

    return {
        id: el.id,
        type: el.type,
        name: el.name,
        description: el.description || "",
        live: true,
        background: url,
        poster: url,
    }
};

serveHTTP(addon.getInterface(), { port: 43000 });