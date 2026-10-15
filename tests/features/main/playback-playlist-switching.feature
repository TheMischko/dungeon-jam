@playlists @playback @audio @switching
Feature: Switching between playlists on landing page

  Scenario: Switching between two playlists plays audio for each playlist
    Given there is a playlist prepared called "Chill Playlist" containing track from fixture "a-minor"
    And there is a playlist prepared called "Rock Playlist" containing track from fixture "b-minor"
    And the user clicks on "Playlists" in navigation menu
    When the user hovers over playlist card "Chill Playlist" and clicks play
    Then the application should be producing audible sound within 5 seconds
    And the active track in player should be "A Minor"
    When the user hovers over playlist card "Rock Playlist" and clicks play
    Then the application should be producing audible sound within 5 seconds
    And the active track in player should be "B Minor"
