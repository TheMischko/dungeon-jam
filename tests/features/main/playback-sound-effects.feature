@sound-effects @playback @audio
Feature: Sound Effects Playback and Concurrency

  Scenario: User can play, inspect pill, and stop a sound effect from library
    Given there is a sound effect prepared called "Magic Bell" from fixture "b-minor"
    And the user clicks on "Sound Effects" in navigation menu
    When the user clicks play on sound effect card "Magic Bell"
    Then the sound effect pill "Magic Bell" should appear in bottom player
    And the application should be producing audible sound within 5 seconds
    When the user stops sound effect "Magic Bell" via pill button
    Then the sound effect pill "Magic Bell" should not be visible in bottom player
    And the application should not be producing audible sound

  Scenario: Sound effect plays concurrently with music playlist playback
    Given there is a playlist prepared called "Atmosphere Playlist" containing track fixtures "a-minor"
    And there is a sound effect prepared called "Combat Spell" from fixture "b-minor"
    And the user clicks on "Playlists" in navigation menu
    When the user hovers over playlist card "Atmosphere Playlist" and clicks play
    Then the application should be producing audible sound within 5 seconds
    And the active track in player should be "A Minor"
    When the user clicks on "Sound Effects" in navigation menu
    And the user clicks play on sound effect card "Combat Spell"
    Then the sound effect pill "Combat Spell" should appear in bottom player
    And the application should be producing audible sound within 5 seconds
    And the active track in player should be "A Minor"
    When the user stops sound effect "Combat Spell" via pill button
    Then the sound effect pill "Combat Spell" should not be visible in bottom player
    And the active track in player should be "A Minor"
    And the application should be producing audible sound within 5 seconds
    When the user clicks pause in the player
    Then the application should not be producing audible sound
