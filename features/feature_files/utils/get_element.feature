Feature: Optional attribute property
  Check whether a string is null or made of empty spaces.

  Scenario Outline: Validate a required/optional attribute
    Given a DOMString <str>
    When I query the DOM for the matched elements
    Then I should be told <exist>

  Examples:
    |  str   | exist | nb
    |  ".list-item"  |  true | #optional
    |  "#body"  |  true | #optional
    | "div"  | false | #required