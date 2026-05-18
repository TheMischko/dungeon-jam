@playlists
Feature: Create playlist modal

  Background:
    Given the user clicks on "Playlists" in navigation menu

  Scenario: User creates a playlist without an image
    When the user opens create playlist modal
    And the user enters "My New Playlist" as playlist name in create playlist modal
    And the user clicks on save in create playlist modal
    Then there should be playlist with name "My New Playlist"
