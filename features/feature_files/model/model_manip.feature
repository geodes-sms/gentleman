Feature: Manipulate a model
  A list of operations that can be done on a model

  Background:
    Given a metamodel

  Scenario: Create an element
    Given a source
    When I try to create a model element
    Then I should get an instance of ModelElement

  Scenario: Create an element as root
    Given a source
    When I try to create a model element as root
    Then I should get an instance of ModelElement
    And the model its root set to the newly created model element

  Scenario: Get an element
    Given a type
    When I try to get a model element
    Then I should get the structure of the model element

  Scenario: Get a missing element
    When I try to get a model missing element
    Then I should get undefined

  Scenario Outline: Generate an identifier
    Given that we have <number> projection
    When I try to generate a new identifier
    Then I should get the following identifier <id>

  Examples:
    | number |   id |
    |      0 |  '0' |  
    |      1 |  '1' |
    |      2 |  '2' |
    |     99 | '99' |

  Scenario Outline: Determines whether the passed type is an element
    Given a <type>
    When I check if it is an element
    Then I should get the following <isElement>

  Scenario Outline: Determines whether the passed type is an enum
    Given a <type>
    When I check if it is an enum
    Then I should get the following <isEnum>

  Scenario Outline: Determines whether the passed type is a datatype
    Given a <type>
    When I check if it is a datatype
    Then I should get the following <isModelDataType>

  Scenario Outline: Determines whether the passed type is a datatype or primitive
    Given a <type>
    When I check if it is a datatype or primitive
    Then I should get the following <isDataType>

  Scenario Outline: Determines whether the passed type is an element composed of elements
    Given a <type>
    When I check if it is has nested elements
    Then I should get the following <hasComposition>

  Examples:
    |       type | isElement | isEnum | isModelDataType | isDataType | hasComposition |
    |  'project' |      true |  false |           false |      false |           true |
    |   'double' |      true |  false |            true |       true |          false |
    | 'category' |      true |  false |           false |      false |          false |
    |    'field' |      true |   true |           false |      false |          false |
    |   'string' |     false |  false |           false |       true |          false |

  Scenario Outline: Get an element full type
    Given an <element>
    When I try to get the type
    Then I should the following type <element_type>

  Examples:
    |        element |            element_type |
    |      'project' |               'project' |
    |       'double' |               'double'  |
    | 'freeCategory' | 'category.freeCategory' |
    |        'field' |                 'field' |