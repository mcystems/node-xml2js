xml2ts
===========

This is a remixed version of the original work of Marek Kubica's [node-xml2js](https://github.com/Leonidas-from-XIV/node-xml2js).

####Differences between this and the original version
* Complete rewrite in typescript.
* Some features removed because of the increased strictness of being type safe.
* Some features or behaviours altered.
* Introduced **XmlTsNode** as resulting object.
* Typed configuration object
* Typed validators and processors
* Position tracking. You always know the actual node position within the original xml.
* Tests are rewrote to a more standard Mocha and Chai.

*Documentation and the builder side is still in progress. The parsing side is done* 

Description
===========

Simple XML to JavaScript object converter.
Uses [sax-js](https://github.com/isaacs/sax-js/) and
[xmlbuilder-js](https://github.com/oozcitak/xmlbuilder-js/).

Note: If you're looking for a full DOM parser, you probably want
[JSDom](https://github.com/tmpvar/jsdom).

This version is somewhat rewrote to typescript. Introduced XmlTsNode as the resulting object. 
Position of each node are  

Ever had the urge to parse XML? And wanted to access the data in some sane,
easy way? Don't want to compile a C parser, for whatever reason? Then xml2js is
what you're looking for!


Installation
============

Simplest way to install `xml2ts` is to use [npm](http://npmjs.org), just `npm
install xml2ts` which will download xml2js and all dependencies.

Usage
=====

No extensive tutorials required because you are a smart developer! The task of
parsing XML should be an easy one, so let's make it so! Here's some examples.

Shoot-and-forget usage
----------------------

You want to parse XML as simple and easy as possible? It's dangerous to go
alone, take this:

```typescript
import {parseString} from 'xml2ts';
var xml = "<root>Hello xml2js!</root>"
const result = await parseString(xml);
```

If you need some special options, fear not, `xml2ts` supports a number of
options (see below), you can specify these as second argument:

```typescript
import {parseString} from 'xml2ts';
parseString(xml, {trim: true});
```

Simple as pie usage
-------------------

That's right, if you have been using xml-simple or a home-grown
wrapper, this was added in 0.1.11 just for you:

```typescript
import * as fs = from 'fs';
import {Parser, parserDefaults, XmlTsNode} from 'xml2ts';

async function f(xml: string): Promise<XmlTsNode> {
  const parser = new Parser(parserDefaults);
  return await parser.parseString(xml);
}
```

Parsing multiple files
----------------------

If you want to parse multiple files, you have multiple possibilities:

  * You can create one `xml2js.Parser` per file. That's the recommended one
    and is promised to always *just work*.
  
So you wanna some JSON?
-----------------------

Just wrap the `result` object in a call to `JSON.stringify` like this
`JSON.stringify(result)`. You get a string containing the JSON representation
of the parsed object that you can feed to JSON-hungry consumers.

### Adding xmlns attributes

You can generate XML that declares XML namespace prefix / URI pairs with xmlns attributes.

Example declaring a default namespace on the root element:

```javascript
let obj = { 
  Foo: {
    $: {
      "xmlns": "http://foo.com"
    }   
  }
};  
```
Result of `buildObject(obj)`:
```xml
<Foo xmlns="http://foo.com"/>
```
Example declaring non-default namespaces on non-root elements:
```javascript
let obj = {
  'foo:Foo': {
    $: {
      'xmlns:foo': 'http://foo.com'
    },
    'bar:Bar': {
      $: {
        'xmlns:bar': 'http://bar.com'
      }
    }
  }
}
```
Result of `buildObject(obj)`:
```xml
<foo:Foo xmlns:foo="http://foo.com">
  <bar:Bar xmlns:bar="http://bar.com"/>
</foo:Foo>
```


Processing attribute, tag names and values
------------------------------------------

Since 0.4.1 you can optionally provide the parser with attribute name and tag name processors as well as element value processors (Since 0.4.14, you can also optionally provide the parser with attribute value processors):

```javascript

function nameToUpperCase(name){
    return name.toUpperCase();
}

//transform all attribute and tag names and values to uppercase
parseString(xml, {
  tagNameProcessors: [nameToUpperCase],
  attrNameProcessors: [nameToUpperCase],
  valueProcessors: [nameToUpperCase],
  attrValueProcessors: [nameToUpperCase]},
  function (err, result) {
    // processed data
});
```

The `tagNameProcessors` and `attrNameProcessors` options
accept an `Array` of functions with the following signature:

```javascript
function (name){
  //do something with `name`
  return name
}
```

The `attrValueProcessors` and `valueProcessors` options
accept an `Array` of functions with the following signature:

```javascript
function (value, name) {
  //`name` will be the node name or attribute name
  //do something with `value`, (optionally) dependent on the node/attr name
  return value
}
```

Some processors are provided out-of-the-box and can be found in `lib/processors.js`:

- `normalize`: transforms the name to lowercase.
(Automatically used when `options.normalize` is set to `true`)

- `firstCharLowerCase`: transforms the first character to lower case.
E.g. 'MyTagName' becomes 'myTagName'

- `stripPrefix`: strips the xml namespace prefix. E.g `<foo:Bar/>` will become 'Bar'.
(N.B.: the `xmlns` prefix is NOT stripped.)

- `parseNumbers`: parses integer-like strings as integers and float-like strings as floats
E.g. "0" becomes 0 and "15.56" becomes 15.56

- `parseBooleans`: parses boolean-like strings to booleans
E.g. "true" becomes true and "False" becomes false

Options
=======

Apart from the default settings, there are a number of options that can be
specified for the parser. Options are specified by ``new Parser({optionName:
value})``. Possible options are:

  * `attrkey` (default: `$`): Prefix that is used to access the attributes.
    Version 0.1 default was `@`.
  * `charkey` (default: `_`): Prefix that is used to access the character
    content. Version 0.1 default was `#`.
  * `explicitCharkey` (default: `false`)
  * `trim` (default: `false`): Trim the whitespace at the beginning and end of
    text nodes.
  * `normalizeTags` (default: `false`): Normalize all tag names to lowercase.
  * `normalize` (default: `false`): Trim whitespaces inside text nodes.
  * `explicitRoot` (default: `true`): Set this if you want to get the root
    node in the resulting object.
  * `emptyTag` (default: `''`): what will the value of empty nodes be.
  * `explicitArray` (default: `true`): Always put child nodes in an array if
    true; otherwise an array is created only if there is more than one.
  * `ignoreAttrs` (default: `false`): Ignore all XML attributes and only create
    text nodes.
  * `mergeAttrs` (default: `false`): Merge attributes and child elements as
    properties of the parent, instead of keying attributes off a child
    attribute object. This option is ignored if `ignoreAttrs` is `true`.
  * `validator` (default `null`): You can specify a callable that validates
    the resulting structure somehow, however you want. See unit tests
    for an example.
  * `xmlns` (default `false`): Give each element a field usually called '$ns'
    (the first character is the same as attrkey) that contains its local name
    and namespace URI.
  * `explicitChildren` (default `false`): Put child elements to separate
    property. Doesn't work with `mergeAttrs = true`. If element has no children
    then "children" won't be created. Added in 0.2.5.
  * `childkey` (default `$$`): Prefix that is used to access child elements if
    `explicitChildren` is set to `true`. Added in 0.2.5.
  * `preserveChildrenOrder` (default `false`): Modifies the behavior of
    `explicitChildren` so that the value of the "children" property becomes an
    ordered array. When this is `true`, every node will also get a `#name` field
    whose value will correspond to the XML nodeName, so that you may iterate
    the "children" array and still be able to determine node names. The named
    (and potentially unordered) properties are also retained in this
    configuration at the same level as the ordered "children" array. Added in
    0.4.9.
  * `charsAsChildren` (default `false`): Determines whether chars should be
    considered children if `explicitChildren` is on. Added in 0.2.5.
  * `includeWhiteChars` (default `false`): Determines whether whitespace-only
     text nodes should be included. Added in 0.4.17.
  * `async` (default `false`): Should the callbacks be async? This *might* be
    an incompatible change if your code depends on sync execution of callbacks.
    Future versions of `xml2js` might change this default, so the recommendation
    is to not depend on sync execution anyway. Added in 0.2.6.
  * `strict` (default `true`): Set sax-js to strict or non-strict parsing mode.
    Defaults to `true` which is *highly* recommended, since parsing HTML which
    is not well-formed XML might yield just about anything. Added in 0.2.7.
  * `attrNameProcessors` (default: `null`): Allows the addition of attribute
    name processing functions. Accepts an `Array` of functions with following
    signature:
    ```javascript
    function (name){
        //do something with `name`
        return name
    }
    ```
    Added in 0.4.14
  * `attrValueProcessors` (default: `null`): Allows the addition of attribute
    value processing functions. Accepts an `Array` of functions with following
    signature:
    ```javascript
    function (name){
      //do something with `name`
      return name
    }
    ```
    Added in 0.4.1
  * `tagNameProcessors` (default: `null`): Allows the addition of tag name
    processing functions. Accepts an `Array` of functions with following
    signature:
    ```javascript
    function (name){
      //do something with `name`
      return name
    }
    ```
    Added in 0.4.1
  * `valueProcessors` (default: `null`): Allows the addition of element value
    processing functions. Accepts an `Array` of functions with following
    signature:
    ```javascript
    function (name){
      //do something with `name`
      return name
    }
    ```
    Added in 0.4.6

Running tests, development
==========================

The development requirements are handled by npm, you just need to install them.
We also have a number of unit tests, they can be run using `npm test` directly
from the project root. This runs zap to discover all the tests and execute
them.

If you like to contribute, keep in mind that `xml2ts` is written in
Typescript, so don't develop on the JavaScript files that are checked into
the repository for convenience reasons. Also, please write some unit test to
check your behaviour and if it is some user-facing thing, add some
documentation to this README, so people will know it exists. Thanks in advance!

Getting support
===============

Please, if you have a problem with the library, first make sure you read this
README. If you read this far, thanks, you're good. Then, please make sure your
problem really is with `xml2ts`. It is? Okay, then I'll look at it. Send me a
mail and we can talk. Please don't open issues, as I don't think that is the
proper forum for support problems. Some problems might as well really be bugs
in `xml2ts`, if so I'll let you know to open an issue instead :)

But if you know you really found a bug, feel free to open an issue instead.
