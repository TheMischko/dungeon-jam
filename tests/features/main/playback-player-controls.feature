@playlists @playback @audio @player-controls
Feature: Bottom player controls

  Scenario: User can pause, resume, and skip between tracks in bottom player
    Given there is a playlist prepared called "Player Controls Playlist" containing track fixtures "a-minor, b-minor"
    And the user clicks on "Playlists" in navigation menu
    When the user hovers over playlist card "Player Controls Playlist" and clicks play
    Then the application should be producing audible sound within 5 seconds
    And the active track in player should be "A Minor"

    When the user clicks pause in the player
    Then the application should not be producing audible sound

    When the user clicks play in the player
    Then the application should be producing audible sound within 5 seconds
    And the active track in player should be "A Minor"

    When the user clicks next track in the player
    Then the active track in player should be "B Minor"
    And the application should be producing audible sound within 5 seconds

    When the user clicks previous track in the player
    Then the active track in player should be "A Minor"
    And the application should be producing audible sound within 5 seconds

