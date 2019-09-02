module.exports = function (grunt) {
    grunt.initConfig({
        uglify: {
            options: {
                mangle: !1
            },
            root_js: {
                files: [{
                    expand: !0,
                    cwd: "js",
                    src: ["*.js", "!*.min.js"],
                    dest: "js",
                    ext: ".min.js"
                }]
            }
        }
    });
    grunt.loadNpmTasks("grunt-contrib-uglify-es");
    grunt.registerTask("default", ["uglify"]);
};