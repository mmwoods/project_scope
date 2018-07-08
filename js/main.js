$(document).ready(function() {
    calculate();

    if (localStorage.getItem("markdownStorage") != null && localStorage.getItem("notesStorage") != null) {
        loadEditors();
    }

    $('.js-toggle-rt, .js-toggle-md, .js-toggle-fn').on('click', function() {
        mode.set(this);
    });
    
    $('.js-errors').click(function() {
        $('.wrapper-errors').toggle();
    });

    $('.js-times-toggle').click(function() {
        $('.wrapper-summary').toggle();
        $('.sidebar').toggleClass('col col-sm-2');
        $('.ace_editor').toggleClass('left-spacing');
        $(this).toggleClass('mode-active');
        ace.edit('editor').resize();
    });
    
    const editorValue = ace.edit('editor').getValue();
    const segments = editorValue.split('---');
    
    function returnTime(input) {
        var hourRegexOb = /(((?<hr>\d+)(hr|hrs|hour|hours)\b)\s+((?<min>\d+)(m|min|mins|minutes)\b))|((?<minutes>\d+)(\s+|)(m|min|mins|minutes)\b)|((?<hours>\d+)(\s+|)(hr|hrs|hour|hours)\b)|((?<decimal>\d+\.\d+)(hr|hrs|hour|hours))/gm;
        var myArray;
        var result = 0;
        
        while ((myArray = hourRegexOb.exec(input)) !== null) {
            if (myArray.groups.hr && myArray.groups.min) result += parseInt(myArray.groups.hr) + myArray.groups.min/60;
            if (myArray.groups.hours) result += parseInt(myArray.groups.hours);
            if (myArray.groups.minutes) result += myArray.groups.minutes/60;
            if (myArray.groups.decimal) result = parseFloat(myArray.groups.decimal);
            
            return result;
        }
        return result;
    }
    
    function totalHours(input) {
        var total = 0;
        var coding = 0;
        var design = 0;
        
        for (i = 0; i < input.length > 0; i++) {
            if (input[i].hours !== undefined) total += input[i].hours;
            if (input[i].type === 'coding') coding += input[i].hours;
            if (input[i].type === 'design') design += input[i].hours;
        }

        return ({
            coding: coding,
            design: design,
            total: total
        });
    }
    
    let segment = segments.map(function(contents) {
        var h2Pattern = new RegExp(/^#{2}\s+((?<title>.*)(\s+|\s+`)(?<time>\(.*\)))/, 'm');
        var bulletPattern = /^-\s.*/gm;
        var subBulletPattern = /^(?!\n)\s+-.*/gm;
        var commentPattern = /^((?<coding>Coding|coding)|(?<design>Mockup|mockup|Wireframe|wireframe|Designs|designs|Design|design)).*/gm;

        if(h2Pattern.test(contents)) { 
            var validPattern = h2Pattern.exec(contents);
            var h2 = validPattern.groups.title;
        }

        // Creating Line Object
        var lineMatch = contents.match(bulletPattern);
        if (lineMatch === null) return {};

        let lineObject = lineMatch.map(function(item) {
            return ({
                line: item,
                hours: returnTime(item),
                type: 'coding'
            });
        });

        // Creating Comment Object
        var commentObject = [];
        var commentMatch;

        while ((commentMatch = commentPattern.exec(contents)) !== null) {
            var type  = '';

            if (commentMatch.groups.coding !== undefined) type = 'coding';
            if (commentMatch.groups.design !== undefined) type = 'design';

            commentObject.push({
                line: commentMatch[0],
                hours: returnTime(commentMatch),
                type: type
            });

            var type  = '';
        }

        // Segment Output
        return {
            title: h2,
            hours: {
                coding: totalHours(commentObject).coding + totalHours(lineObject).coding,
                design: totalHours(commentObject).design + totalHours(lineObject).design,
                total: totalHours(commentObject).total + totalHours(lineObject).total,
            },
            comments: commentObject,
            content: lineObject,
        };
    });
    
    // Removes segments without titles
    for (var i = segment.length - 1; i >= 0; i--) {
        if (segment[i].title === undefined) segment.splice(i, 1);
    }

    $('.js-calculate').click(function() {
        saveEditors();
        calculate();

        if (segment !== undefined) {
            calculateTotalHours(segment);
            location.reload();
        }
    });
    
    console.log(segment);
    calculateTotalHours(segment);

    function calculateTotalHours(input) {
        $('.js-segments').html('');

        var designTotal = 0;
        var codingTotal = 0;

        for (var i = 0; i < input.length; i++) {
            createSegment(input[i].hours.design, input[i].hours.coding, input[i].title);
            
            designTotal += input[i].hours.design;
            codingTotal += input[i].hours.coding;
        }
        createSegment(designTotal, codingTotal, 'Project');
    }
    
    function saveEditors() {
        if (typeof(Storage) !== "undefined") {
            var markdownEditor = ace.edit('editor');
            var notesEditor = ace.edit('notesEditor');
    
            // Store
            localStorage.setItem("markdownStorage", markdownEditor.getValue());
            localStorage.setItem("notesStorage", notesEditor.getValue());
        }
    }
    
    function loadEditors() {
        if (typeof(Storage) !== "undefined") {
            var markdownEditor = ace.edit('editor');
            var notesEditor = ace.edit('notesEditor');
    
            // Retrieve
            markdownEditor.setValue(localStorage.getItem("markdownStorage"));
            notesEditor.setValue(localStorage.getItem("notesStorage"));
        }
    }
    
    function calculate() {
        // calculateTotalHours(segment);
        runMarkdown();
        runFeatureNotes();
    }
    
    const mode = {
        clear() {
            $('.wrapper-menu .menu .menu-btn').each(function() {
                $(this).find('.fa').removeClass('active');
                $('.editor, .sidebar').hide();
                $('.editor').removeClass('d-sm-block');
                ace.edit('editor').clearSelection();
                ace.edit('notesEditor').clearSelection();
            });
        },
        set(mode) {
            this.clear();
            calculate();
    
            var editor = ($(mode).data('editor'));
            var preview = ($(mode).data('preview'));
            var sidebar = ($(mode).data('sidebar'));
    
            $(mode).find('.fa').addClass('active');
            $(editor).show();
            $(sidebar).show();
            $(preview).toggleClass('d-none d-sm-block');

            ace.edit('editor').clearSelection();
            ace.edit('notesEditor').clearSelection();

            // Feature Notes Colour
            var colour = $('#fn-2').val();
            $('#targetDiv h1').css('background-color', colour);
            $('#targetDiv h2, #targetDiv h3').css('border-color', colour);
        }
    }

    mode.set('.js-toggle-md');
    
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
    
    function createSegment(designSegment, codingSegment, segmentTitle) {
        var contents = $('.js-segments').html();
        let markup = '';
    
        const segment = [
            { title: 'Total', colour: 'purple', icon: 'clock-o', hours: designSegment + codingSegment},
            { title: 'Design', colour: 'blue', icon: 'pencil', hours: designSegment },
            { title: 'Coding', colour: 'yellow', icon: 'code', hours: codingSegment }
        ];
    
        function renderSegment(segment) {
            return segment.map(segment => segment.hours ? `
                <div class="menu-row">
                    <p><i class="fa fa-${segment.icon} circle-bg ${segment.colour} text-center pull-left"></i> ${segment.title}</p>
                    <p><span class="${segment.colour}-colour">Hours</span> <span class="pull-right">${segment.hours}</span></p>
                </div>
                <hr>
            ` : '').join('');
        }
    
        markup += `
            <div class="wrapper-segment">
                <h2 class="section-title">${segmentTitle}</h2>
                ${renderSegment(segment)}
            </div>
        `;
    
        $('.js-segments').html(contents + markup);
    }
});