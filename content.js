var updateList = function(month) {
  var list = $('.list');
  list.children().each(function() {
    var subject = $(this).children().eq(0).text();
    subject = subject.replace('Ⅰ', '1').replace('Ｂ', 'B').replace('Ａ', 'A');
    if (!data[subject]) {
      console.error('[error] unknown subbect:', JSON.stringify(subject));
      return;
    };
    var subject_ok = -1;
    $(this).find('.comp a').each(function(cid) {
      var x = $(this);
      var title = x.text().replace(/^\s+|\s+$/g, '');
      var i = 0;
      for (i=0; i<months.length; i++) {
        if (data[subject][months[i]] > cid) break;
      }
      var limit = months[i];
      x.text('《' + limit + '月》 ' + title);
      // 今月締め切り
      if (limit <= month) {
        var base = x.parent().parent();
        var c_status = base.find('span').text();
        if (c_status == '完了') {
          base.css('background-color', '#d9edf7');
          if (subject_ok == -1) subject_ok = 1;
        }
        else {
          base.css('background-color', '#f2dede');
          subject_ok = 0;
        }
      }
    });
    switch (subject_ok) {
      case 1:
        $(this).css('background-color', '#d9edf7');
        break;
      case 0:
        $(this).css('background-color', '#f2dede');
        break;
    }
  });
};
// dropdown
var select_tag = $('<select>');
months.forEach(function(x) {
  select_tag.append( $('<option>').text( x + '月').val(x) );
});
select_tag.change(function() {
  console.log('changed');
  //updateList(5);
});
$('.list').before(select_tag);

updateList(months[0]);
