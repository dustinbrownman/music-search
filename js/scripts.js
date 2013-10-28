$(function() {
  $("form#search").submit(function() {
    var searchPhrase = $("input#user-input").val();
    searchPhrase = encodeURI(searchPhrase);

    $.get("http://ws.spotify.com/search/1/track.json?q=" + searchPhrase)
      .done(function(response) {
        $("#search-results table").empty().append("<tr><th>Track</th><th>Album</th><th>Artist</th><th class='text-right'>Length</th></tr>");
        $("input#user-input").val("");
        response.tracks.forEach(function(track) {
          var rating = Math.round(track.popularity * 5);
          $("#search-results table").append("<tr class='showing'>" + 
              "<td class='name text-primary'>" + track.name + "</td>" +
              "<td class='album text-muted'>" + track.album.name + "</td>" + 
              "<td class='artist text-muted'>" + track.artists[0].name + "</td>" +
              "<td class='length text-muted text-right'>" + secondsToMinutes(track.length) + "</td>" +
            "</tr><tr class='hiding'>" +
              "<td><a target='_blank' href='http://open.spotify.com/" + track.href.slice(8).replace(":", "/") + "'><img src='img/spotify-icon.png'></a> <small class='text-muted'>play on Spotify</small> <small class='text-muted'>| Track : " + track["track-number"] + " " + " </small></td>" +
              "<td></td>" +
            "</tr>"
          );

          $("#search-results td.name").last().click(function() {
            $(this).parent("tr").next("tr").fadeToggle(200);
          });

          $("#search-results table tr td.album").last().click(function() {
            var thisTrack = this;
            $('#album-modal h2').empty();
            $('#album-modal h5').empty();
            $('#album-modal ul').empty();
            $("#album-modal img").remove();
            $.get("http://ws.spotify.com/lookup/1/.json?uri=" + track.album.href + "&extras=trackdetail")
              .done(function(detailedResponse) {
                $('#album-modal h2').prepend(detailedResponse.album.name);
                $('#album-modal h5').append(detailedResponse.album.artist);

                var artistName = encodeURI(detailedResponse.album.artist);
                var albumName = encodeURI(detailedResponse.album.name);
                $.ajax("http://api.discogs.com/database/search?artist=" + artistName + "&release_title=" + albumName, {"DataType":"JSONP"})
                  .done(function(albumArtResult) {
                    $("#album-modal div.page-header").prepend("<img class='pull-left' src='" + albumArtResult.results[0].thumb + "'>")
                  });
                detailedResponse.album.tracks.forEach(function(track) {
                  $('#album-modal ul').append("<li><div class='row'>" +
                    "<span class='track-number text-muted col-1'>" + track["track-number"] + "</span>" +
                    "<span class='name text-primary col-9'>" + track.name + "</span>" + 
                    "<span class='length text-muted text-right col-1'>" + secondsToMinutes(track.length) + "</span>" +
                  "</div></li>"
                  );
                });
                $('#album-modal').modal('show');
              });
          });
        });
        $("#search-results").slideDown();
      });

    return false;
  });
});

function secondsToMinutes(seconds) {
  var mins = Math.floor(seconds / 60);
  var secs = Math.floor(seconds % 60);
  return mins + ":" + (secs < 10 ? "0" + secs : secs);
}