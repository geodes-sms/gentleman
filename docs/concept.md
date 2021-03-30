# Concept

In Gentleman, we distinguish between four types of concepts: primitive, concrete, prototype and derivative. Attributes are used to associate concepts.

## Primitive

Primitives are self-defined concepts (no attributes), accessible globally to any model. They contain specific properties on which constraints may be applied.
> Every concept can be resolved to a composition of primitives.

### String

The string concept allows you to store and manipulate sequence of characters.

#### Properties

- **Default** `[string]`: Default value. This value is assigned to all newly created instance.

#### Constraints

- **Length**: Number of characters of the sequence.
  - Fix: Restrict the length to a fixed value
    - value `[number]`: the fixed number of character
  - Range: Restrict the length to a range (inclusive)
    - min `[number]`: the minimum number of character
    - max `[number]`: the maximum number of character
- **Value**: Pattern used to validate a sequence.
  - Regex: Define a regular expression
    - insensitive `[boolean=true]`: indicates whether case should be ignored while attempting a match.
    - global `[boolean=true]`: indicates whether the pattern should be tested against all possible matches.
    - value `[string]`: the text of the pattern
  - Assert: Define an assertion on part of the sequence
    - start `[string]`: the characters to be searched for at the beginning of the sequence
    - end `[string]`: the characters to be searched for at the end of the sequence
- **Values** `[set:string]`: List of valid sequences used to restrict the list of accepted sequences.

### Number

The number concept allows you to store and manipulate numbers

#### Properties

- **Default** `[number]`: Default value. This value is assigned to all newly created instance.

#### Constraints

- **Value** `[number]`: Comparison used to validate the number.
  - Fix: Restrict the value to a fixed number
    - value `[number]`: the fixed number
  - Range: Restrict the value to a range (inclusive)
    - min `[number]`: the minimum value
    - max `[number]`: the maximum value
- **Values** `[set:number]`: List of valid numbers used to restrict the list of accepted numbers.

### Boolean

The boolean concept allows you to store and manipulate boolean values

#### Properties

- **Default** `[boolean]`: Default value. This value is assigned to all newly created instance.

### Set

The set concept allows you to store and manipulate collections of distinct elements.

#### Properties

- **accept** `[concept]`: the concept used for the set's element
- **ordered** `[boolean=true]`: indicates whether the set is ordered

#### Constraints

- **Cardinality**: Number of element in the set.
  - Fix: Restrict the cardinality to a fixed value
    - value `[number]`: the fixed number of element
  - Range: Restrict the cardinality to a range (inclusive)
    - min `[number]`: the minimum number of element
    - max `[number]`: the maximum number of element

### Reference

The reference concept allows you to store and manipulate concepts references.

#### Properties

- **accept** `[set:element]`: the target concept eligible for reference

#### Constraints

- **rel** `[string={parent|child|sibling}]`: specifies the relationship between the reference and the target reference.
  - parent: the target is a parent of the reference
  - child: the target is a child of the reference
  - sibling: the target has the same parent as the reference
- **scope** `[concept]`: defines the boundary of the potential target reference

## Concrete

They represent the core concepts of the model and unlike primitives, they are specific to a model

## Prototype

A prototype creates a base skeleton to provide reusability and extension to concepts of the model,
similar to prototype-based programming. Any concept can reuse a prototype and would inherit its structure.
Prototypes follow the Liskov substitution principle. If the target of an attribute, then any concept
reusing it can also be the target. In this case, any property or constraint defined on the attribute.

## Derivative

A derivative is a concept derived from another one (base). Every value that can be captured by a
derivative must also be valid for its base concept. When the base is a primitive, it can serve as
a form of specialization.

## Attribute

An attribute is a characteristic defined on the concept.

## Property

A property is a characteristic defined by (held by) the concept.
