const ParcelProxyServer = require('parcel-proxy-server');

// configure the proxy server
const server = new ParcelProxyServer({
  entryPoint: '/LUMA_GIS/master_code/index.html',
  parcelOptions: {
    // provide parcel options here
    // these are directly passed into the
    // parcel bundler
    //
    // More info on supported options are documented at
    // https://parceljs.org/api
    https: true
  },
  proxies: {
    // add proxies here
    '/kart10test': {
      target: 'https://kart10test.nibio.no/geoserver/sl/wms'
    }
  }
});

// the underlying parcel bundler is exposed on the server
// and can be used if needed
server.bundler.on('buildEnd', () => {
  console.log('Build completed!');
});

// start up the server
server.listen(1234, () => {
  console.log('Parcel proxy server has started');
});
