#Less Bundle Promise (less-bundle-promise)

Bundle all of your LESS files into a single file. Useful for large projects with multiple components utilizing their own LESS files.

## Usage

```javascript
var bundle = require('less-bundle-promise');

bundle({
    src: 'main.less'
}).then(output =>{
  // do something with output less
}).catch(error => {
  console.log('Error', error);
});

// Or write to a file
bundle({
    src: 'main.less',
    dest: 'bundle.less',
    writeFile: true
}).then(output =>{
  // do something with output less
}).catch(error => {
  console.log('Error', error);
});

A `bundle.less` file will be generated with all less output
```

## Options

```typescript
interface IConfig {
    /**
     * The index.html file used to find all the *.less files and 
     * build them in order. Starts at the <!-- less-bundle-start -->
     * comment and ends at <!-- less-bundle-end -->
     */
    src: string;

    /**
     * An array of destination file paths. Once the framework 
     * is built, it will be output to these paths.
     */
    dest: Array<string>;

    /**
    * Boolean flag to indicate that if we want the compiled css into dest file or not 
    */
    writeFile?: boolean;

    /**
     * The version number used in conjunction with the license.
     */
    version?: string;

    /**
     * The path to the license file to be added to the build as a
     * comment. If a version is specified, the v.0.0.0 in the 
     * license will be replaced with the version.
     */
    license?: string;
}
```

