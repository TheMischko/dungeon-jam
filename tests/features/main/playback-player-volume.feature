@playlists @playback @audio @player-volume @volume
Feature: Player Volume Control

  Scenario: User can adjust playback volume and mute audio using volume slider
    Given there is a playlist prepared called "Volume Test Playlist" containing track fixtures "a-minor"
    And the user clicks on "Playlists" in navigation menu
    When the user hovers over playlist card "Volume Test Playlist" and clicks play
    Then the application should be producing audible sound within 5 seconds
    And the player volume icon should indicate unmuted
    When the user sets volume in the player to 0
    Then the application should not be producing audible sound
    And the player volume icon should indicate muted
    When the user sets volume in the player to 1
    Then the application should be producing audible sound within 5 seconds
    And the player volume icon should indicate unmuted
