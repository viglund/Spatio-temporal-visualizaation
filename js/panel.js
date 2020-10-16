/*jshint esversion: 6 */


export function initPanel() {


  var infoPanel = $.jsPanel({
    id: 'infoPanel',
    title: 'Spatio-temporal visualization',
    resizable: {
      handles: 'se'
    },
    size: {
      width: window.innerWidth / 4,
      height: (window.innerHeight / 4) * 3
    },
    position: {
      left: 10,
      top: 10
    },
    // theme:    'light',
    overflow: 'auto',
    ajax: {
      url: 'panel.html?random='+ Math.random(),
      done: function( data, textStatus, jqXHR, panel ) {
        panelLoaded();
      }
    }
  });


  infoPanel.on('jspanelbeforeclose', function(){
     $('#open_info_button').show();
  });
}



function panelLoaded() {

  /**
   * Handle radio change event.
   */


  $('#open_info_button').hide();
  var isDrawing = false;
  $('#list').hide();



  $('#save_button').click(function() {
    index.saveObjects();
  });

  $('#help_button').click(function(event) {
    event.preventDefault();
		event.stopPropagation();
		window.open('https://www.nibio.no/tjenester/opplasting-av-mis-data/veiledning-ajourforingsklient', '_blank');
  });


  $('#back_button').click(function(event) {
    event.preventDefault();
    event.stopPropagation();
    var newWindow = window.open('', '_self', ''); //open the current window
    newWindow.close();
    //if (confirm("Denne nettleseren tillater ikke at denne fanen lukkes? Lukk det selv for å gå tilbake til Kilden")) {
      close();
    //}
  });


  $('#info_button').click(function(event) {
    event.preventDefault();
    event.stopPropagation();
    window.open('https://www.landbruksdirektoratet.no/no/miljo-og-okologisk/areal-og-jordvern/kostra#hva-rapporteres-det-paa-', '_blank');
  });



}
