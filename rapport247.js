// Rapport 24/7 API
//
// JavaScript library
//
// Protected by GNU GPL 3.0
// http://www.gnu.org/licenses/gpl-3.0.txt
//
//
function rapport247()
{
  var API_command=function($command, $parameter, $selector, $handler)
  {
    try
    {
      // This is the standard entry point for the API Requests
      //
      // * Sets up the response handler
      // * Creates AJAX receiving element
      // * Dispatches the AJAX request
      // * Returns the response handler ID
      //
      // $command   = One of the supported commands for the API
      // $parameter = Any command specific data the API needs
      // $selector  = The final place for the data
      // $handler   = The function to receive and process validated server responses
      //
      //
      console.log("API_command("+$command+", [PARAMETER], "+$selector+", "+$handler+")");
      console.log("PARAMETER: <start>");
      console.log($parameter);
      console.log("PARAMETER: </stop>");
      //
      //
      // Setup the response handler
      // Create the response ID
      var $response_id=$command+"_"+(Math.floor(Math.random() * 9000) + 1000)+"a"+(Math.floor(Math.random() * 9000) + 1000)+"a"+(Math.floor(Math.random() * 9000) + 1000);
      // Make sure the response ID is unique
      var $count=0;
      while ($response_id in $requests)
      {
        // Not unique, try again
        $response_id=$command+"_"+(Math.floor(Math.random() * 9000) + 1000)+"a"+(Math.floor(Math.random() * 9000) + 1000)+"a"+(Math.floor(Math.random() * 9000) + 1000)+"b"+$count;
        $count++;
      }
      console.log('$response_id=['+$response_id+"]");
      //
      // Create the response handler object
      $requests[$response_id]=new Object();
      $requests[$response_id]['selector']=$selector;
      $requests[$response_id]['handler']=$handler;
      //
      var $URL=API_URL($command, $parameter, $response_id);
      console.log("$URL=["+$URL+"]");
      //
      // Create the AJAX receiving element
      $(document.body).append("<div id='"+$response_id+"' style='display:none;'></div>");
      //
      // Check to see if it worked
      if ($('#'+$response_id).length===0)
      {
        console.log("Could not create AJAX receiving element: ERROR");
        return false;
      }
      else
      {
        console.log("Created AJAX receiving element: OK");
        $('#'+$response_id).load($URL, function($server_response){API_response_handler($server_response);});
      } // if ($('#'+$response_id).length===0)
      //
      return $response_id;
    }
    catch ($err)
    {
      console.log($err.stack);
      return false;
    } // try
  } // API_command()
  //
  //
  var API_URL=function($command, $parameter, $request_id)
  {
    console.log('API_URL('+$command+', [PARAMETER], '+$request_id+')');
    //
    // Creates the URL for a given API call
    //
    var $parameter_JSON=JSON.stringify($parameter);
    console.log("parameter_JSON=["+$parameter_JSON+"]");
    //
    session_from_cookie();
    //
    if ($session_id=='')
    {
      $session_id='NONE';
    }
    //
    var $session_id_URI    =encodeURIComponent($session_id);
    var $command_URI       =encodeURIComponent($command);
    var $parameter_JSON_URI=encodeURIComponent($parameter_JSON);
    var $request_id_URI    =encodeURIComponent($request_id);
    console.log("session_URI=["+$session_id_URI+"]");
    console.log("command_URI=["+$command_URI+"]");
    console.log("parameter_JSON_URI=["+$parameter_JSON_URI+"]");
    console.log("request_id_URI=["+$request_id_URI+"]");
    //
    var $URL=$api+"index.php?SESSION_ID="+$session_id_URI+"&COMMAND="+$command_URI+"&PARAMETER="+$parameter_JSON_URI+"&REQUEST_ID="+$request_id_URI;
    //
    return $URL;
  } // API_URL()
  //
  //
  var API_response_decode=function($server_response)
  {
    // This decodes the JSON
    //
    // Returns the decoded JSON, or FALSE
    //
    //
    try
    {
      console.log("API_response_decode([SERVER_RESPONSE])");
      //
      // Attempt to decode the response object
      var $decoded=JSON.parse($server_response);
      // If it gets here, it decoded
      //
      return $decoded;
    }
    catch ($err)
    {
      // JSON did not decode
      //
      console.log($err.stack);
      return false;
    } // try
  } // API_response_decode()
  //
  //
  var API_cleanup=function($request_id)
  {
    try
    {
      console.log("API_cleanup("+$request_id+")");
      //
      $('#'+$request_id).remove();
      // Check to see if it worked
      if ($('#'+$response_id).length!==0)
      {
        console.log("Could not remove AJAX receiving element: ERROR");
        return false;
      }
      console.log("Removed AJAX receiving element: OK");
      //
      delete $requests[$request_id];
      if ($requests.indexOf($request_id)!==-1)
      {
        console.log("Could not delete request handler record: ERROR");
        return false;
      }
      console.log("Deleted request handler record: OK");
      //
      return true;
    }
    catch ($err)
    {
      // Could not clean up
      console.log($err.stack);
      return false;
    } // try
  } // API_cleanup()
  //
  //
  var API_response_handler=function ($server_response)
  {
    try
    {
      console.log("API_response_handler()");
      //
      var $decoded=API_response_handler_validate($server_response);
      if ($decoded===false)
      {
        console.log("Server response is not valid: ERROR");
        return false;
      }
      //
      console.log('$decoded.REQUEST_ID=['+$decoded.REQUEST_ID+']');
      //
      var $selector=$requests[$decoded.REQUEST_ID]['selector'];
      return $requests[$decoded.REQUEST_ID]['handler']({'DATA':$decoded.DATA, 'selector':$selector});
    }
    catch ($err)
    {
      console.log($err.stack);
    } // try
  } // API_response_handler()
  //
  //
  var API_response_handler_validate=function ($server_response)
  {
    console.log("API_response_handler_validate()");
    //
    // Validates that the return information from the server is acceptable to process
    //
    // A standard response quadruplet has these parts:
    //   STATUS = OK | ERROR
    //   MESSAGE = A machine readable and human friendly description of the data
    //   DATA = The data from the message
    //   REQUEST_ID = The request ID for data matching purposes
    //
    // RETURNS the decoded JSON, or FALSE
    //
    //
    var $decoded=API_response_decode($server_response);
    //
    if ($decoded===false)
    {
      console.log("server_response did not decode: ERROR");
      return false;
    }
    else
    {
      console.log("server_response decoded: OK");
      //
      // Does it have the property of STATUS?
      if (!$decoded.hasOwnProperty('STATUS'))
      {
        console.log('STATUS is missing: ERROR');
        return false;
      }
      console.log('STATUS is present: OK');
      //
      // Is STATUS a known value?
      if (($decoded.STATUS!=='OK') &&
          ($decoded.STATUS!=='ERROR'))
      {
        console.log('STATUS has unsupported value ['+$decoded.STATUS+']: ERROR');
        return false;
      }
      console.log('STATUS is supported: OK');
      //
      // Does it have the MESSAGE property?
      if (!$decoded.hasOwnProperty('MESSAGE'))
      {
        // No, the message property is missing
        console.log('MESSAGE is missing: ERROR');
        return false;
      }
      console.log('MESSAGE is present: OK');
      //
      // Is MESSAGE a known value?
      if (($decoded.MESSAGE!=='VIDEO__LIST_BY_VENUE_ID') &&
          ($decoded.MESSAGE!=='VIDEO__BY_ID'))
      {
        console.log('MESSAGE has unsupported value ['+$decoded.MESSAGE+']: ERROR');
        return false;
      }
      console.log('MESSAGE is supported: OK');
      //
      // Does it have the DATA property?
      if (!$decoded.hasOwnProperty('DATA'))
      {
        // No, the message property is missing
        console.log('decoded is missing DATA');
        return false;
      }
      console.log('DATA is present: OK');
      //
      // Does it have the REQUEST_ID property?
      if (!$decoded.hasOwnProperty('REQUEST_ID'))
      {
        // No, the message property is missing
        console.log('decoded is missing REQUEST_ID');
        return false;
      }
      console.log('REQUEST_ID is present: OK');
      //
      // Is the REQUEST_ID valid?
      console.log($requests);
      if (!($requests.hasOwnProperty($decoded.REQUEST_ID)))
      {
        // No, the REQUEST_ID is invalid
        console.log('REQUEST_ID is invalid: ERROR');
        return false;
      }
      console.log('REQUEST_ID is supported: OK');
      //
      // All the parts are present
      console.log('Server response is properly formed: OK');
      //
      return $decoded;
    } // if ($decoded===false)
  } // API_response_handler_validate()
  //
  //
  var session_from_cookie=function()
  {
    console.log('session_from_cookie()');
    var $element;
    var $cookies=document.cookie;
    var $parts=$cookies.split('; ');
    for(var $i=0, $len=$parts.length; $i<$len; $i++)
    {
      var $pieces=$parts[$i].split('=');
      if ($pieces[0]=='session')
      {
        this.session_id=$pieces[1];
      }
    }
    //
    console.log('this.session_id=['+this.session_id+']');
    return this.session_id;
  } // session_from_cookie()
  //
  //
  var construct=function ()
  {
    // This function is the "constructor" function for the Rapport247 object
    //
    var $result='ERROR';
    //
    // This object requires jQuery to be installed
    // Is jQuery missing?
    if (typeof jQuery==='undefined')
    {
      // Yes, jQuery is missing
      $result='JQuery required';
    }
    else
    {
      // This object requires jQuery to be minimum version 2.1.3
      if (jquery_min_version("2.1.3")===false)
      {
        $result='JQuery version 2.1.3 or greater required';
      }
      else
      {
        $result='OK';
      } // if (jquery_min_version("2.1.3")!==false)
    } // if (typeof jQuery!='undefined')
    //
    console.log("Rapport247: construct()=>["+$result+"]");
    //
    return $result;
  } // construct()
  //
  //
  var jquery_min_version=function($version)
  {
    // https://gist.github.com/budiadiono/7954617
    var $vrs=window.jQuery.fn.jquery.split('.');
    var $min=$version.split('.');
    var $prevs=[];
    var $len=$vrs.length;
    //
    for (var $i=0; $i<$len; $i++)
    {
      //console.log($i, $vrs[$i], $min[$i], $prevs[$i-1]);
      if ($min[$i] && $vrs[$i] < $min[$i])
      {
        if (!$prevs[$i-1] || $prevs[$i-1] == 0)
        {
          return false;
        }
      }
      else
      {
        if ($vrs[$i] > $min[$i])
        {
          $prevs[$i] = 1;
        }
        else
        {
          $prevs[$i] = 0;
        }
      }
    }
    return true;
  } // jquery_min_version()
  //
  //
  this.fetch_videos=function($selector, $venue_id)
  {
    // This function attempts to fetch all the API accessible videos from the server
    //
    // $selector = The final place to put the videos
    // $venue_id = The venue_id of the venue to fetch
    //
    console.log("fetch_videos=function("+$selector+", "+$venue_id+")");
    return API_command('VIDEO__LIST_BY_VENUE_ID', $selector, {'venue_id':$venue_id});
  } // this.fetch_videos()
  //
  //
  var fetch_videos_finish=function($data_JSON)
  {
    console.log("fetch_videos_finish()");
    //
    console.log($data_JSON);
    var $video;
    for ($video in $data_JSON)
    {}
    //
    return;
  } // fetch_videos_finish()
  //
  //
  this.fetch_and_format_videos=function($selector, $venue_id)
  {
    // This function attempts to fetch all the API accessible videos from the server
    //
    // $selector = The final place to put the videos
    // $venue_id = The venue_id of the venue to fetch
    //
    console.log("fetch_and_format_videos=function("+$selector+", "+$venue_id+")");
    return API_command('VIDEO__LIST_BY_VENUE_ID', {'venue_id':$venue_id},  $selector, function ($server_response){fetch_and_format_videos_finish($server_response);});
  } // this.fetch_and_format_videos()
  //
  //
  var fetch_and_format_videos_finish=function($parameters)
  {
    console.log("fetch_and_format_videos_finish([PARAMETERS])");
    //
    var $data=$parameters.DATA;
console.log($data);
    var $selector=$parameters.selector;
    //
    var $HTML="";
    var $idx=1;
    var $video;
    for ($video in $data)
    {
      $HTML+=format_video($data[$video], $idx);
      $idx++;
    } // for ($video in $data)
    //
    $($selector).html($HTML);
    //
    return $HTML;
  } // fetch_and_format_videos_finish()
  //
  //
  var format_video=function($video, $idx)
  {
    console.log ("format_video([VIDEO], [TEMPLATE])");
    //
    if ($video['kind']=='testimonial')
    {
      var $result=$testimonial.replace(new RegExp('#DOMAIN#', 'g'), $domain);
    }
    else
    {
      var $result=$review.replace(new RegExp('#DOMAIN#', 'g'), $domain);
    }
    //
    $result=$result.replace(new RegExp('#IDX#', 'g'), $idx);
    //
    var $key;
    //
    for($key in $language)
    {
      $result=$result.replace(new RegExp($key, 'g'), $language[$key]);
    } // for($key in $video)
    //
    for($key in $video)
    {
      $result=$result.replace(new RegExp('#VIDEO__'+$key.toUpperCase()+'#', 'g'), $video[$key]);
    } // for($key in $video)
    //
    $result=$result.replace('CLOSE',      $language.PLAY_VIDEO);
    $result=$result.replace('COPY_RIGHT', $language.COPY_RIGHT);
    $result=$result.replace('NUDITY',     $language.NUDITY);
    $result=$result.replace('OTHER',      $language.OTHER);
    $result=$result.replace('PLAY_VIDEO', $language.PLAY_VIDEO);
    $result=$result.replace('REPORT',     $language.REPORT);
    $result=$result.replace('VIOLENCE',   $language.VIOLENCE);
    //
    return $result;
  } // format_video()
  //
  //
  this.identify=function()
  {
    console.log("Rapport247 Javascript API Version 1.0");
  } // this.identify
  //
  //
  var $api='https://ybstung.com/api/';
  var $domain='https://ybstung.com/ops/';
  var $language=new Array();
      $language.CLOSE     ='Close';
      $language.COPY_RIGHT='Copy Right';
      $language.NUDITY    ='Nudity';
      $language.OTHER     ='Other';
      $language.PLAY_VIDEO='Play Video';
      $language.REPORT    ='Report';
      $language.VIOLENCE  ='Violence';
  var $requests=new Array();
  var $review= '<div id="#VIDEO__ID#" class=".r247_child" style="width: 300px; margin-right:5px;">';
      $review+='  <div class="thumbnail" data-toggle="modal" data-target="#myModal#IDX#">';
      $review+='    <img alt="#VIDEO__TITLE#" src="#DOMAIN##VIDEO__KIND#/#VIDEO__JPG_URL#">';
      $review+='    <div class="modal fade" id="myModal#IDX#" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
      $review+='      <div class="modal-dialog">';
      $review+='        <div class="modal-content">';
      $review+='          <div class="modal-header">';
      $review+='            <button type="button" class="close" data-dismiss="#myModal#IDX#" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
      $review+='            <video preload="none" width="480" height="270" poster="#DOMAIN##VIDEO__KIND#/#VIDEO__JPG_URL#" controls>';
      $review+='              <source src="#DOMAIN##VIDEO__KIND#/#VIDEO__MP4_URL#" type="video/mp4"/>';
      $review+='              <source src="#DOMAIN##VIDEO__KIND#/#VIDEO__WEBM_URL#" type="video/webm"/>';
      $review+='            </video>';
      $review+='          </div>';
      $review+='          <div class="modal-footer">';
      $review+='            <button type="button" class="btn btn-default" data-dismiss="#myModal#IDX#">#CLOSE#</button>';
      $review+='          </div>';
      $review+='        </div>';
      $review+='      </div>';
      $review+='    </div>';
      $review+='    <div class="caption">';
      $review+='      <h3>#VIDEO__TITLE#</h3>';
      $review+='      <p>#VIDEO__DESCRIPTION#</p>';
      $review+='      <div class="container">';
      $review+='        <div class="row">';
      $review+='          <div class="col-xs-2 col-md-2">';
      $review+='            <button class="btn btn-primary">';
      $review+='              #PLAY_VIDEO#';
      $review+='            </button>';
      $review+='          </div>';
      $review+='        </div>';
      $review+='      </div>';
      $review+='    </div>';
      $review+='  </div>';
      $review+='</div>';
  var $session_id='';
  var $status=construct();
  var $testimonial= '<div id="#VIDEO__ID#" class=".r247_child" style="width: 300px; margin-right:5px;">';
      $testimonial+='  <div class="thumbnail" data-toggle="modal" data-target="#myModal#IDX#">';
      $testimonial+='    <img alt="#VIDEO__TITLE#" src="#DOMAIN##VIDEO__KIND#/#VIDEO__JPG_URL#">';
      $testimonial+='    <div class="modal fade" id="myModal#IDX#" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
      $testimonial+='      <div class="modal-dialog">';
      $testimonial+='        <div class="modal-content">';
      $testimonial+='          <div class="modal-header">';
      $testimonial+='            <button type="button" class="close" data-dismiss="#myModal#IDX#" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
      $testimonial+='            <video preload="none" width="480" height="270" poster="#DOMAIN##VIDEO__KIND#/#VIDEO__JPG_URL#" controls>';
      $testimonial+='              <source src="#DOMAIN##VIDEO__KIND#/#VIDEO__MP4_URL#" type="video/mp4"/>';
      $testimonial+='              <source src="#DOMAIN##VIDEO__KIND#/#VIDEO__WEBM_URL#" type="video/webm"/>';
      $testimonial+='            </video>';
      $testimonial+='          </div>';
      $testimonial+='          <div class="modal-footer">';
      $testimonial+='            <button type="button" class="btn btn-default" data-dismiss="#myModal#IDX#">#CLOSE#</button>';
      $testimonial+='          </div>';
      $testimonial+='        </div>';
      $testimonial+='      </div>';
      $testimonial+='    </div>';
      $testimonial+='    <div class="caption">';
      $testimonial+='      <h3>#VIDEO__TITLE#</h3>';
      $testimonial+='      <p>#VIDEO__DESCRIPTION#</p>';
      $testimonial+='      <div class="container">';
      $testimonial+='        <div class="row">';
      $testimonial+='          <div class="col-xs-2 col-md-2">';
      $testimonial+='            <button class="btn btn-primary">';
      $testimonial+='              #PLAY_VIDEO#';
      $testimonial+='            </button>';
      $testimonial+='          </div>';
      $testimonial+='        </div>';
      $testimonial+='      </div>';
      $testimonial+='    </div>';
      $testimonial+='  </div>';
      $testimonial+='</div>';
  //
  //
  return;
} // rapport247()