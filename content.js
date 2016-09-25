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
  var vt, vp;

  function parseSubjectName(subject) {
    subject = subject.replace('Ⅰ', '1').replace('Ｂ', 'B').replace('Ａ', 'A');
    if (!data[subject]) {
      console.error('[error] unknown subject:', JSON.stringify(subject));
      return null;
    }
    return subject;
  }
  function getDeadline(subject, cid) {
    var i = 0;
    for (i=0; i<months.length; i++) {
      if (data[subject][months[i]] > cid) break;
    }
    return months[i];
  }

  // labeling
  $('.list').children().each(function() {
    var subject = parseSubjectName($(this).children().eq(0).text());
    if (subject == null) return;
    var subject_ok = -1;
    $(this).find('.comp a, .normal a').each(function(cid) {
      var title = $(this).text().replace(/^\s+|\s+$/g, '');
      $(this).text('《' + getDeadline(subject, cid) + '月》 ' + title);
    });
  });

  var updateList = function(month) {
    var num_ok = 0, num_ng = 0;
    $('.list').last().children().each(function() {
      var subject = parseSubjectName($(this).children().eq(0).text());
      if (subject == null) return;
      var subject_ok = -1;
      $(this).find('.comp a, .normal a').each(function(cid) {
        var x = $(this);
        var title = x.text().replace(/^\s+|\s+$/g, '');
        var deadline = getDeadline(subject, cid);

        if (deadline <= month) {
          var base = x.parent().parent();
          var c_status = base.find('span').text();
          if (/完了|レポート提出済み/.test(c_status)) {
            base.css('background-color', '#d9edf7');
            if (deadline == month) {
              if (subject_ok == -1) subject_ok = 1;
              num_ok += 1;
            }
          }
          else {
            base.css('background-color', '#f2dede');
            if (deadline == month) {
              subject_ok = 0;
              num_ng += 1;
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
    var num_all = num_ok + num_ng;
    vt.text(num_ok + ' / ' + num_all);
    vp.text(Math.round(100.0 * num_ok / num_all) + '%');
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

  vt = $('<a>').text('- / -');
  vp = $('<span>').addClass('important').text('- %');
 // div#contents ul.list li ul li span
  $('.list').before($('<ul>').addClass('list')
    .append($('<li>')
    .append($('<ul>')
    .append($('<li>').attr('id', 'statusbar')
      .append($('<p>').append(vt))
      .append(vp)
    )
    )
    )
  );
  updateList(months_rest[0]);
}
