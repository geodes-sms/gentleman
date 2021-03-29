# Concept

In Gentleman, the language engineer defines his DSL concepts using a collection of structures called concept.
A collection of concepts and their relations are aggregated into a model. In Gentleman, we distinguish between four types of concepts: primitive, concrete, prototype, or derivative concepts. Attributes are used to associate concepts.

## Primitive

Primitives are self-defined concepts and, therefore, not related to any other concepts: they have no attributes. For better model integration, primitives are accessible globally to any model.
Every concept can be resolved to a composition of primitives.
They contain specific properties on which constraints may be applied when
defining an attribute to restrict the concept.

### String

The string concept allows you to store and manipulate sequence of characters

#### Properties

- **default** `[string]`: Default value. This value is assigned to all newly created instance.
- **length** `[string]`: Number of characters of the sequence. This property can be constrained to a fix value or a range.
- **value** `[number]`: Value assigned to the instance. This property can be constrained with a Regex pattern or a match against the start or end of the sequence.
- **values** `[set:string]`: List of valid sequences. This property can be used to restrict the list of accepted string values.

### Number

The number concept allows you to store and manipulate numbers

#### Properties

- **default** `[number]`: Default value. This value is assigned to all newly created instance.
- **value** `[number]`: Value assigned to the instance. This property can be constrained to a fix value or a range.
- **values** `[set:number]`: List of valid numbers. This property can be used to restrict the list of accepted number values.

### Boolean

The boolean concept allows you to store and manipulate boolean values

#### Properties

- **default** `[boolean]`: Default value. This value is assigned to all newly created instance.

### Set

The set concept allows you to store and manipulate collections of distinct elements

#### Properties

- **accept** `[concept]` (*required*): Defines link's displayed content
- **ordered** `[boolean]`: Defines how the link should be processed
- **cardinality** `[set:number]`: Defines how the link should be processed

### Reference

The reference concept allows you to store and manipulate elements references.

#### Properties

- **accept** `[set:element]` (*required*): Defines link's displayed content
- **rel** `[string={parent|child|sibling|origin}]` (*required*): Defines the link's url
- **scope** `[concept]`: Defines how the link should be processed

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
