Feature: Optional attribute property
  Check whether a string is null or made of empty spaces.

  Scenario Outline: Validate a required/optional attribute
    Given a string <str>
    When I ask whether it's null or made of whitespace
    Then I should be told <valid>

  Examples:
    |  str   | valid | 
    |    ""  |  true | #optional
    |   " "  |  true | #optional
    | "hey"  | false | #required
    | "null" |  true | #required