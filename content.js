if (location.pathname.endsWith('/unit')) {
  function convertTimeToSeconds(text) {
    return text.split(':').reduce(function(a, b) { return parseInt(a)*60 + parseInt(b) });
  }
  function convertSecondsToTime(seconds) {
    var date = new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  }

  var totaltime = 0;
  var unfinished_total = 0;
  var count_unfinished = 0;
  $('.list').each(function() {
    var text = $(this).children().children().eq(1).text().trim();
    if ( $(this).find('.complete').size() == 0 ) {
      unfinished_total += convertTimeToSeconds(text.split(/ |　/).slice(-1)[0]);
      count_unfinished += 1;
    }
    totaltime += convertTimeToSeconds(text.split(/ |　/).slice(-1)[0]);
  });
  $('#result_unit_movie h1, #report_unit_movie h1')
    .append(' - ' + convertSecondsToTime(unfinished_total)
          + ' / ' + convertSecondsToTime(totaltime)
          + ' (' + count_unfinished + ')');
}
else {
  $('.list').children().each(function() {
    var subject = $(this).children().eq(0).text();
    subject = subject.replace('Ⅰ', '1').replace('Ｂ', 'B').replace('Ａ', 'A');
    if (!data[subject]) {
      console.error('[error] unknown subject:', JSON.stringify(subject));
      return;
    };
    var subject_ok = -1;
    $(this).find('.comp a, .normal a').each(function(cid) {
      var x = $(this);
      var title = x.text().replace(/^\s+|\s+$/g, '');
      var i = 0;
      for (i=0; i<months.length; i++) {
        if (data[subject][months[i]] > cid) break;
      }
      x.text('《' + months[i] + '月》 ' + title);
    });
  });

  var updateList = function(month) {
    var ret = { num_ok: 0, num_ng: 0 };
    $('.list').last().children().each(function() {
      var subject = $(this).children().eq(0).text();
      subject = subject.replace('Ⅰ', '1').replace('Ｂ', 'B').replace('Ａ', 'A');
      if (!data[subject]) {
        console.error('[error] unknown subject:', JSON.stringify(subject));
        return;
      };
      var subject_ok = -1;
      $(this).find('.comp a, .normal a').each(function(cid) {
        var x = $(this);
        var title = x.text().replace(/^\s+|\s+$/g, '');
        var i = 0;
        for (i=0; i<months.length; i++) {
          if (data[subject][months[i]] > cid) break;
        }
        var limit = months[i];
        // 今月締め切り
        if (limit <= month) {
          var base = x.parent().parent();
          var c_status = base.find('span').text();
          if (c_status == '完了' || c_status == 'レポート提出済み') {
            base.css('background-color', '#d9edf7');
            if (limit == month) {
              if (subject_ok == -1) subject_ok = 1;
              ret.num_ok += 1;
            }
          }
          else {
            base.css('background-color', '#f2dede');
            if (limit == month) {
              subject_ok = 0;
              ret.num_ng += 1;
            }
          }
        }
        else {
          var base = x.parent().parent();
          base.css('background-color', '');
        }
      });
      switch (subject_ok) {
        case -1:
          $(this).css('background-color', '');
          break;
        case 0:
          $(this).css('background-color', '#f2dede');
          break;
        case 1:
          $(this).css('background-color', '#d9edf7');
          break;
      }
    });
    return ret;
  };
  // dropdown
  var select_tag = $('<select>');
  months_rest.forEach(function(x) {
    select_tag.append( $('<option>').text( x + '月').val(x) );
  });
  select_tag.change(function() {
    updateList($('select option:selected').val());
  });
  $('.list').before(select_tag);

  var ret = updateList(months_rest[0]);
  var num_all = ret.num_ok + ret.num_ng;
  // div#contents ul.list li ul li span
  $('.list').before($('<ul>').addClass('list')
    .append($('<li>')
    .append($('<ul>')
    .append($('<li>')
      .append($('<p>').append($('<a>').text(ret.num_ok + ' / ' + num_all)))
      .append(
        $('<span>')
        .addClass('important')
        .text(Math.round(100.0 * ret.num_ok / num_all) + '%')
      )
    )
    )
    )
  );
}
