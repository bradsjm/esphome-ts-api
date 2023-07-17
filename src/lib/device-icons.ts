const MDI_ICONS: Record<string, string> = {
    "ac": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M6.59%2C0.66C8.93%2C-1.15%2011.47%2C1.06%2012.04%2C4.5C12.47%2C4.5%2012.89%2C4.62%2013.27%2C4.84C13.79%2C4.24%2014.25%2C3.42%2014.07%2C2.5C13.65%2C0.35%2016.06%2C-1.39%2018.35%2C1.58C20.16%2C3.92%2017.95%2C6.46%2014.5%2C7.03C14.5%2C7.46%2014.39%2C7.89%2014.16%2C8.27C14.76%2C8.78%2015.58%2C9.24%2016.5%2C9.06C18.63%2C8.64%2020.38%2C11.04%2017.41%2C13.34C15.07%2C15.15%2012.53%2C12.94%2011.96%2C9.5C11.53%2C9.5%2011.11%2C9.37%2010.74%2C9.15C10.22%2C9.75%209.75%2C10.58%209.93%2C11.5C10.35%2C13.64%207.94%2C15.39%205.65%2C12.42C3.83%2C10.07%206.05%2C7.53%209.5%2C6.97C9.5%2C6.54%209.63%2C6.12%209.85%2C5.74C9.25%2C5.23%208.43%2C4.76%207.5%2C4.94C5.37%2C5.36%203.62%2C2.96%206.59%2C0.66M5%2C16H7A2%2C2%200%200%2C1%209%2C18V24H7V22H5V24H3V18A2%2C2%200%200%2C1%205%2C16M5%2C18V20H7V18H5M12.93%2C16H15L12.07%2C24H10L12.93%2C16M18%2C16H21V18H18V22H21V24H18A2%2C2%200%200%2C1%2016%2C22V18A2%2C2%200%200%2C1%2018%2C16Z%22%20%2F%3E%3C%2Fsvg%3E",
    "aquarium": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12%2C20L12.76%2C17C9.5%2C16.79%206.59%2C15.4%205.75%2C13.58C5.66%2C14.06%205.53%2C14.5%205.33%2C14.83C4.67%2C16%203.33%2C16%202%2C16C3.1%2C16%203.5%2C14.43%203.5%2C12.5C3.5%2C10.57%203.1%2C9%202%2C9C3.33%2C9%204.67%2C9%205.33%2C10.17C5.53%2C10.5%205.66%2C10.94%205.75%2C11.42C6.4%2C10%208.32%2C8.85%2010.66%2C8.32L9%2C5C11%2C5%2013%2C5%2014.33%2C5.67C15.46%2C6.23%2016.11%2C7.27%2016.69%2C8.38C19.61%2C9.08%2022%2C10.66%2022%2C12.5C22%2C14.38%2019.5%2C16%2016.5%2C16.66C15.67%2C17.76%2014.86%2C18.78%2014.17%2C19.33C13.33%2C20%2012.67%2C20%2012%2C20M17%2C11A1%2C1%200%200%2C0%2016%2C12A1%2C1%200%200%2C0%2017%2C13A1%2C1%200%200%2C0%2018%2C12A1%2C1%200%200%2C0%2017%2C11Z%22%20%2F%3E%3C%2Fsvg%3E",
    "car": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M18.92%202C18.72%201.42%2018.16%201%2017.5%201H6.5C5.84%201%205.29%201.42%205.08%202L3%208V16C3%2016.55%203.45%2017%204%2017H5C5.55%2017%206%2016.55%206%2016V15H18V16C18%2016.55%2018.45%2017%2019%2017H20C20.55%2017%2021%2016.55%2021%2016V8L18.92%202M6.5%2012C5.67%2012%205%2011.33%205%2010.5S5.67%209%206.5%209%208%209.67%208%2010.5%207.33%2012%206.5%2012M17.5%2012C16.67%2012%2016%2011.33%2016%2010.5S16.67%209%2017.5%209%2019%209.67%2019%2010.5%2018.33%2012%2017.5%2012M5%207L6.5%202.5H17.5L19%207H5M7%2020H11V18L17%2021H13V23L7%2020Z%22%20%2F%3E%3C%2Fsvg%3E",
    "computer": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M18.92%202C18.72%201.42%2018.16%201%2017.5%201H6.5C5.84%201%205.29%201.42%205.08%202L3%208V16C3%2016.55%203.45%2017%204%2017H5C5.55%2017%206%2016.55%206%2016V15H18V16C18%2016.55%2018.45%2017%2019%2017H20C20.55%2017%2021%2016.55%2021%2016V8L18.92%202M6.5%2012C5.67%2012%205%2011.33%205%2010.5S5.67%209%206.5%209%208%209.67%208%2010.5%207.33%2012%206.5%2012M17.5%2012C16.67%2012%2016%2011.33%2016%2010.5S16.67%209%2017.5%209%2019%209.67%2019%2010.5%2018.33%2012%2017.5%2012M5%207L6.5%202.5H17.5L19%207H5M7%2020H11V18L17%2021H13V23L7%2020Z%22%20%2F%3E%3C%2Fsvg%3E",
    "cup": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M2%2C21H20V19H2M20%2C8H18V5H20M20%2C3H4V13A4%2C4%200%200%2C0%208%2C17H14A4%2C4%200%200%2C0%2018%2C13V10H20A2%2C2%200%200%2C0%2022%2C8V5C22%2C3.89%2021.1%2C3%2020%2C3Z%22%20%2F%3E%3C%2Fsvg%3E",
    "dehumidifier": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M20.84%2022.73L16.29%2018.18C15.2%2019.3%2013.69%2020%2012%2020C8.69%2020%206%2017.31%206%2014C6%2012.67%206.67%2011.03%207.55%209.44L1.11%203L2.39%201.73L22.11%2021.46L20.84%2022.73M18%2014C18%2010%2012%203.25%2012%203.25S10.84%204.55%209.55%206.35L17.95%2014.75C18%2014.5%2018%2014.25%2018%2014Z%22%20%2F%3E%3C%2Fsvg%3E",
    "dishes": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M18%2C2H6A2%2C2%200%200%2C0%204%2C4V20A2%2C2%200%200%2C0%206%2C22H18A2%2C2%200%200%2C0%2020%2C20V4A2%2C2%200%200%2C0%2018%2C2M10%2C4A1%2C1%200%200%2C1%2011%2C5A1%2C1%200%200%2C1%2010%2C6A1%2C1%200%200%2C1%209%2C5A1%2C1%200%200%2C1%2010%2C4M7%2C4A1%2C1%200%200%2C1%208%2C5A1%2C1%200%200%2C1%207%2C6A1%2C1%200%200%2C1%206%2C5A1%2C1%200%200%2C1%207%2C4M18%2C20H6V8H18V20M14.67%2C15.33C14.69%2C16.03%2014.41%2C16.71%2013.91%2C17.21C12.86%2C18.26%2011.15%2C18.27%2010.09%2C17.21C9.59%2C16.71%209.31%2C16.03%209.33%2C15.33C9.4%2C14.62%209.63%2C13.94%2010%2C13.33C10.37%2C12.5%2010.81%2C11.73%2011.33%2C11L12%2C10C13.79%2C12.59%2014.67%2C14.36%2014.67%2C15.33%22%20%2F%3E%3C%2Fsvg%3E",
    "drill": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M18%2016H16V15H8V16H6V15H2V20H22V15H18V16M20%208H17V6C17%204.9%2016.1%204%2015%204H9C7.9%204%207%204.9%207%206V8H4C2.9%208%202%208.9%202%2010V14H6V12H8V14H16V12H18V14H22V10C22%208.9%2021.1%208%2020%208M15%208H9V6H15V8Z%22%20%2F%3E%3C%2Fsvg%3E",
    "fan": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12%2C11A1%2C1%200%200%2C0%2011%2C12A1%2C1%200%200%2C0%2012%2C13A1%2C1%200%200%2C0%2013%2C12A1%2C1%200%200%2C0%2012%2C11M12.5%2C2C17%2C2%2017.11%2C5.57%2014.75%2C6.75C13.76%2C7.24%2013.32%2C8.29%2013.13%2C9.22C13.61%2C9.42%2014.03%2C9.73%2014.35%2C10.13C18.05%2C8.13%2022.03%2C8.92%2022.03%2C12.5C22.03%2C17%2018.46%2C17.1%2017.28%2C14.73C16.78%2C13.74%2015.72%2C13.3%2014.79%2C13.11C14.59%2C13.59%2014.28%2C14%2013.88%2C14.34C15.87%2C18.03%2015.08%2C22%2011.5%2C22C7%2C22%206.91%2C18.42%209.27%2C17.24C10.25%2C16.75%2010.69%2C15.71%2010.89%2C14.79C10.4%2C14.59%209.97%2C14.27%209.65%2C13.87C5.96%2C15.85%202%2C15.07%202%2C11.5C2%2C7%205.56%2C6.89%206.74%2C9.26C7.24%2C10.25%208.29%2C10.68%209.22%2C10.87C9.41%2C10.39%209.73%2C9.97%2010.14%2C9.65C8.15%2C5.96%208.94%2C2%2012.5%2C2Z%22%20%2F%3E%3C%2Fsvg%3E",
    "freezer": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M8%2C8V6H10V8H8M7%2C2H17A2%2C2%200%200%2C1%2019%2C4V19A2%2C2%200%200%2C1%2017%2C21V22H15V21H9V22H7V21A2%2C2%200%200%2C1%205%2C19V4A2%2C2%200%200%2C1%207%2C2M7%2C4V9H17V4H7M8%2C12V15H10V12H8Z%22%20%2F%3E%3C%2Fsvg%3E",
    "fridge": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M8%2C8V6H10V8H8M7%2C2H17A2%2C2%200%200%2C1%2019%2C4V19A2%2C2%200%200%2C1%2017%2C21V22H15V21H9V22H7V21A2%2C2%200%200%2C1%205%2C19V4A2%2C2%200%200%2C1%207%2C2M7%2C4V9H17V4H7M8%2C12V15H10V12H8Z%22%20%2F%3E%3C%2Fsvg%3E",
    "game": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M7%2C6H17A6%2C6%200%200%2C1%2023%2C12A6%2C6%200%200%2C1%2017%2C18C15.22%2C18%2013.63%2C17.23%2012.53%2C16H11.47C10.37%2C17.23%208.78%2C18%207%2C18A6%2C6%200%200%2C1%201%2C12A6%2C6%200%200%2C1%207%2C6M6%2C9V11H4V13H6V15H8V13H10V11H8V9H6M15.5%2C12A1.5%2C1.5%200%200%2C0%2014%2C13.5A1.5%2C1.5%200%200%2C0%2015.5%2C15A1.5%2C1.5%200%200%2C0%2017%2C13.5A1.5%2C1.5%200%200%2C0%2015.5%2C12M18.5%2C9A1.5%2C1.5%200%200%2C0%2017%2C10.5A1.5%2C1.5%200%200%2C0%2018.5%2C12A1.5%2C1.5%200%200%2C0%2020%2C10.5A1.5%2C1.5%200%200%2C0%2018.5%2C9Z%22%20%2F%3E%3C%2Fsvg%3E",
    "garage": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M19%2C20H17V11H7V20H5V9L12%2C5L19%2C9V20M8%2C12H16V14H8V12M8%2C15H16V17H8V15M16%2C18V20H8V18H16Z%22%20%2F%3E%3C%2Fsvg%3E",
    "grill": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M19%2C20H17V11H7V20H5V9L12%2C5L19%2C9V20M8%2C12H16V14H8V12M8%2C15H16V17H8V15M16%2C18V20H8V18H16Z%22%20%2F%3E%3C%2Fsvg%3E",
    "heat": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M17.66%2011.2C17.43%2010.9%2017.15%2010.64%2016.89%2010.38C16.22%209.78%2015.46%209.35%2014.82%208.72C13.33%207.26%2013%204.85%2013.95%203C13%203.23%2012.17%203.75%2011.46%204.32C8.87%206.4%207.85%2010.07%209.07%2013.22C9.11%2013.32%209.15%2013.42%209.15%2013.55C9.15%2013.77%209%2013.97%208.8%2014.05C8.57%2014.15%208.33%2014.09%208.14%2013.93C8.08%2013.88%208.04%2013.83%208%2013.76C6.87%2012.33%206.69%2010.28%207.45%208.64C5.78%2010%204.87%2012.3%205%2014.47C5.06%2014.97%205.12%2015.47%205.29%2015.97C5.43%2016.57%205.7%2017.17%206%2017.7C7.08%2019.43%208.95%2020.67%2010.96%2020.92C13.1%2021.19%2015.39%2020.8%2017.03%2019.32C18.86%2017.66%2019.5%2015%2018.56%2012.72L18.43%2012.46C18.22%2012%2017.66%2011.2%2017.66%2011.2M14.5%2017.5C14.22%2017.74%2013.76%2018%2013.4%2018.1C12.28%2018.5%2011.16%2017.94%2010.5%2017.28C11.69%2017%2012.4%2016.12%2012.61%2015.23C12.78%2014.43%2012.46%2013.77%2012.33%2013C12.21%2012.26%2012.23%2011.63%2012.5%2010.94C12.69%2011.32%2012.89%2011.7%2013.13%2012C13.9%2013%2015.11%2013.44%2015.37%2014.8C15.41%2014.94%2015.43%2015.08%2015.43%2015.23C15.46%2016.05%2015.1%2016.95%2014.5%2017.5H14.5Z%22%20%2F%3E%3C%2Fsvg%3E",
    "heater": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M7.95%2C3L6.53%2C5.19L7.95%2C7.4H7.94L5.95%2C10.5L4.22%2C9.6L5.64%2C7.39L4.22%2C5.19L6.22%2C2.09L7.95%2C3M13.95%2C2.89L12.53%2C5.1L13.95%2C7.3L13.94%2C7.31L11.95%2C10.4L10.22%2C9.5L11.64%2C7.3L10.22%2C5.1L12.22%2C2L13.95%2C2.89M20%2C2.89L18.56%2C5.1L20%2C7.3V7.31L18%2C10.4L16.25%2C9.5L17.67%2C7.3L16.25%2C5.1L18.25%2C2L20%2C2.89M2%2C22V14A2%2C2%200%200%2C1%204%2C12H20A2%2C2%200%200%2C1%2022%2C14V22H20V20H4V22H2M6%2C14A1%2C1%200%200%2C0%205%2C15V17A1%2C1%200%200%2C0%206%2C18A1%2C1%200%200%2C0%207%2C17V15A1%2C1%200%200%2C0%206%2C14M10%2C14A1%2C1%200%200%2C0%209%2C15V17A1%2C1%200%200%2C0%2010%2C18A1%2C1%200%200%2C0%2011%2C17V15A1%2C1%200%200%2C0%2010%2C14M14%2C14A1%2C1%200%200%2C0%2013%2C15V17A1%2C1%200%200%2C0%2014%2C18A1%2C1%200%200%2C0%2015%2C17V15A1%2C1%200%200%2C0%2014%2C14M18%2C14A1%2C1%200%200%2C0%2017%2C15V17A1%2C1%200%200%2C0%2018%2C18A1%2C1%200%200%2C0%2019%2C17V15A1%2C1%200%200%2C0%2018%2C14Z%22%20%2F%3E%3C%2Fsvg%3E",
    "humidifier": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12%2C20A6%2C6%200%200%2C1%206%2C14C6%2C10%2012%2C3.25%2012%2C3.25C12%2C3.25%2018%2C10%2018%2C14A6%2C6%200%200%2C1%2012%2C20Z%22%20%2F%3E%3C%2Fsvg%3E",
    "kettle": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12.5%2C3C7.81%2C3%204%2C5.69%204%2C9V9C4%2C10.19%204.5%2C11.34%205.44%2C12.33C4.53%2C13.5%204%2C14.96%204%2C16.5C4%2C17.64%204%2C18.83%204%2C20C4%2C21.11%204.89%2C22%206%2C22H19C20.11%2C22%2021%2C21.11%2021%2C20C21%2C18.85%2021%2C17.61%2021%2C16.5C21%2C15.28%2020.66%2C14.07%2020%2C13L22%2C11L19%2C8L16.9%2C10.1C15.58%2C9.38%2014.05%2C9%2012.5%2C9C10.65%2C9%208.95%2C9.53%207.55%2C10.41C7.19%2C9.97%207%2C9.5%207%2C9C7%2C7.21%209.46%2C5.75%2012.5%2C5.75V5.75C13.93%2C5.75%2015.3%2C6.08%2016.33%2C6.67L18.35%2C4.65C16.77%2C3.59%2014.68%2C3%2012.5%2C3M12.5%2C11C12.84%2C11%2013.17%2C11.04%2013.5%2C11.09C10.39%2C11.57%208%2C14.25%208%2C17.5V20H6V17.5A6.5%2C6.5%200%200%2C1%2012.5%2C11Z%22%20%2F%3E%3C%2Fsvg%3E",
    "leafblower": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12.5%2C3C7.81%2C3%204%2C5.69%204%2C9V9C4%2C10.19%204.5%2C11.34%205.44%2C12.33C4.53%2C13.5%204%2C14.96%204%2C16.5C4%2C17.64%204%2C18.83%204%2C20C4%2C21.11%204.89%2C22%206%2C22H19C20.11%2C22%2021%2C21.11%2021%2C20C21%2C18.85%2021%2C17.61%2021%2C16.5C21%2C15.28%2020.66%2C14.07%2020%2C13L22%2C11L19%2C8L16.9%2C10.1C15.58%2C9.38%2014.05%2C9%2012.5%2C9C10.65%2C9%208.95%2C9.53%207.55%2C10.41C7.19%2C9.97%207%2C9.5%207%2C9C7%2C7.21%209.46%2C5.75%2012.5%2C5.75V5.75C13.93%2C5.75%2015.3%2C6.08%2016.33%2C6.67L18.35%2C4.65C16.77%2C3.59%2014.68%2C3%2012.5%2C3M12.5%2C11C12.84%2C11%2013.17%2C11.04%2013.5%2C11.09C10.39%2C11.57%208%2C14.25%208%2C17.5V20H6V17.5A6.5%2C6.5%200%200%2C1%2012.5%2C11Z%22%20%2F%3E%3C%2Fsvg%3E",
    "lightbulb": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12%2C2A7%2C7%200%200%2C0%205%2C9C5%2C11.38%206.19%2C13.47%208%2C14.74V17A1%2C1%200%200%2C0%209%2C18H15A1%2C1%200%200%2C0%2016%2C17V14.74C17.81%2C13.47%2019%2C11.38%2019%2C9A7%2C7%200%200%2C0%2012%2C2M9%2C21A1%2C1%200%200%2C0%2010%2C22H14A1%2C1%200%200%2C0%2015%2C21V20H9V21Z%22%20%2F%3E%3C%2Fsvg%3E",
    "media_console": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M5%2C15.5A0.5%2C0.5%200%200%2C1%204.5%2C16H3.5A0.5%2C0.5%200%200%2C1%203%2C15.5V15H2A1%2C1%200%200%2C1%201%2C14V11A1%2C1%200%200%2C1%202%2C10H22A1%2C1%200%200%2C1%2023%2C11V14A1%2C1%200%200%2C1%2022%2C15H21V15.5A0.5%2C0.5%200%200%2C1%2020.5%2C16H19.5A0.5%2C0.5%200%200%2C1%2019%2C15.5V15H5V15.5M3%2C12V13H5V12H3M6%2C12V13H8V12H6M20.5%2C11.5A1%2C1%200%200%2C0%2019.5%2C12.5A1%2C1%200%200%2C0%2020.5%2C13.5A1%2C1%200%200%2C0%2021.5%2C12.5A1%2C1%200%200%2C0%2020.5%2C11.5Z%22%20%2F%3E%3C%2Fsvg%3E",
    "modem": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M20.2%2C5.9L21%2C5.1C19.6%2C3.7%2017.8%2C3%2016%2C3C14.2%2C3%2012.4%2C3.7%2011%2C5.1L11.8%2C5.9C13%2C4.8%2014.5%2C4.2%2016%2C4.2C17.5%2C4.2%2019%2C4.8%2020.2%2C5.9M19.3%2C6.7C18.4%2C5.8%2017.2%2C5.3%2016%2C5.3C14.8%2C5.3%2013.6%2C5.8%2012.7%2C6.7L13.5%2C7.5C14.2%2C6.8%2015.1%2C6.5%2016%2C6.5C16.9%2C6.5%2017.8%2C6.8%2018.5%2C7.5L19.3%2C6.7M19%2C13H17V9H15V13H5A2%2C2%200%200%2C0%203%2C15V19A2%2C2%200%200%2C0%205%2C21H19A2%2C2%200%200%2C0%2021%2C19V15A2%2C2%200%200%2C0%2019%2C13M8%2C18H6V16H8V18M11.5%2C18H9.5V16H11.5V18M15%2C18H13V16H15V18Z%22%20%2F%3E%3C%2Fsvg%3E",
    "outlet": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M20.2%2C5.9L21%2C5.1C19.6%2C3.7%2017.8%2C3%2016%2C3C14.2%2C3%2012.4%2C3.7%2011%2C5.1L11.8%2C5.9C13%2C4.8%2014.5%2C4.2%2016%2C4.2C17.5%2C4.2%2019%2C4.8%2020.2%2C5.9M19.3%2C6.7C18.4%2C5.8%2017.2%2C5.3%2016%2C5.3C14.8%2C5.3%2013.6%2C5.8%2012.7%2C6.7L13.5%2C7.5C14.2%2C6.8%2015.1%2C6.5%2016%2C6.5C16.9%2C6.5%2017.8%2C6.8%2018.5%2C7.5L19.3%2C6.7M19%2C13H17V9H15V13H5A2%2C2%200%200%2C0%203%2C15V19A2%2C2%200%200%2C0%205%2C21H19A2%2C2%200%200%2C0%2021%2C19V15A2%2C2%200%200%2C0%2019%2C13M8%2C18H6V16H8V18M11.5%2C18H9.5V16H11.5V18M15%2C18H13V16H15V18Z%22%20%2F%3E%3C%2Fsvg%3E",
    "papershredder": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M6%2C3V7H8V5H16V7H18V3H6M5%2C8A3%2C3%200%200%2C0%202%2C11V17H5V14H19V17H22V11A3%2C3%200%200%2C0%2019%2C8H5M18%2C10A1%2C1%200%200%2C1%2019%2C11A1%2C1%200%200%2C1%2018%2C12A1%2C1%200%200%2C1%2017%2C11A1%2C1%200%200%2C1%2018%2C10M7%2C16V21H9V16H7M11%2C16V20H13V16H11M15%2C16V21H17V16H15Z%22%20%2F%3E%3C%2Fsvg%3E",
    "printer": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M18%2C3H6V7H18M19%2C12A1%2C1%200%200%2C1%2018%2C11A1%2C1%200%200%2C1%2019%2C10A1%2C1%200%200%2C1%2020%2C11A1%2C1%200%200%2C1%2019%2C12M16%2C19H8V14H16M19%2C8H5A3%2C3%200%200%2C0%202%2C11V17H6V21H18V17H22V11A3%2C3%200%200%2C0%2019%2C8Z%22%20%2F%3E%3C%2Fsvg%3E",
    "pump": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M19%2C14.5C19%2C14.5%2021%2C16.67%2021%2C18A2%2C2%200%200%2C1%2019%2C20A2%2C2%200%200%2C1%2017%2C18C17%2C16.67%2019%2C14.5%2019%2C14.5M5%2C18V9A2%2C2%200%200%2C1%203%2C7A2%2C2%200%200%2C1%205%2C5V4A2%2C2%200%200%2C1%207%2C2H9A2%2C2%200%200%2C1%2011%2C4V5H19A2%2C2%200%200%2C1%2021%2C7V9L21%2C11A1%2C1%200%200%2C1%2022%2C12A1%2C1%200%200%2C1%2021%2C13H17A1%2C1%200%200%2C1%2016%2C12A1%2C1%200%200%2C1%2017%2C11V9H11V18H12A2%2C2%200%200%2C1%2014%2C20V22H2V20A2%2C2%200%200%2C1%204%2C18H5Z%22%20%2F%3E%3C%2Fsvg%3E",
    "skillet": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M19%2019C19%2020.1%2018.1%2021%2017%2021H7C5.9%2021%205%2020.1%205%2019V12H3V10H21V12H19V19Z%22%20%2F%3E%3C%2Fsvg%3E",
    "smartcamera": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12%2C2A7%2C7%200%200%2C1%2019%2C9A7%2C7%200%200%2C1%2012%2C16A7%2C7%200%200%2C1%205%2C9A7%2C7%200%200%2C1%2012%2C2M12%2C4A5%2C5%200%200%2C0%207%2C9A5%2C5%200%200%2C0%2012%2C14A5%2C5%200%200%2C0%2017%2C9A5%2C5%200%200%2C0%2012%2C4M12%2C6A3%2C3%200%200%2C1%2015%2C9A3%2C3%200%200%2C1%2012%2C12A3%2C3%200%200%2C1%209%2C9A3%2C3%200%200%2C1%2012%2C6M6%2C22A2%2C2%200%200%2C1%204%2C20C4%2C19.62%204.1%2C19.27%204.29%2C18.97L6.11%2C15.81C7.69%2C17.17%209.75%2C18%2012%2C18C14.25%2C18%2016.31%2C17.17%2017.89%2C15.81L19.71%2C18.97C19.9%2C19.27%2020%2C19.62%2020%2C20A2%2C2%200%200%2C1%2018%2C22H6Z%22%20%2F%3E%3C%2Fsvg%3E",
    "socket": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M16%2C7V3H14V7H10V3H8V7H8C7%2C7%206%2C8%206%2C9V14.5L9.5%2C18V21H14.5V18L18%2C14.5V9C18%2C8%2017%2C7%2016%2C7Z%22%20%2F%3E%3C%2Fsvg%3E",
    "solar_alt": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M11.45%2C2V5.55L15%2C3.77L11.45%2C2M10.45%2C8L8%2C10.46L11.75%2C11.71L10.45%2C8M2%2C11.45L3.77%2C15L5.55%2C11.45H2M10%2C2H2V10C2.57%2C10.17%203.17%2C10.25%203.77%2C10.25C7.35%2C10.26%2010.26%2C7.35%2010.27%2C3.75C10.26%2C3.16%2010.17%2C2.57%2010%2C2M17%2C22V16H14L19%2C7V13H22L17%2C22Z%22%20%2F%3E%3C%2Fsvg%3E",
    "sound": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12%2C12A3%2C3%200%200%2C0%209%2C15A3%2C3%200%200%2C0%2012%2C18A3%2C3%200%200%2C0%2015%2C15A3%2C3%200%200%2C0%2012%2C12M12%2C20A5%2C5%200%200%2C1%207%2C15A5%2C5%200%200%2C1%2012%2C10A5%2C5%200%200%2C1%2017%2C15A5%2C5%200%200%2C1%2012%2C20M12%2C4A2%2C2%200%200%2C1%2014%2C6A2%2C2%200%200%2C1%2012%2C8C10.89%2C8%2010%2C7.1%2010%2C6C10%2C4.89%2010.89%2C4%2012%2C4M17%2C2H7C5.89%2C2%205%2C2.89%205%2C4V20A2%2C2%200%200%2C0%207%2C22H17A2%2C2%200%200%2C0%2019%2C20V4C19%2C2.89%2018.1%2C2%2017%2C2Z%22%20%2F%3E%3C%2Fsvg%3E",
    "stove": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M6%2C14H8L11%2C17H9L6%2C14M4%2C4H5V3A1%2C1%200%200%2C1%206%2C2H10A1%2C1%200%200%2C1%2011%2C3V4H13V3A1%2C1%200%200%2C1%2014%2C2H18A1%2C1%200%200%2C1%2019%2C3V4H20A2%2C2%200%200%2C1%2022%2C6V19A2%2C2%200%200%2C1%2020%2C21V22H17V21H7V22H4V21A2%2C2%200%200%2C1%202%2C19V6A2%2C2%200%200%2C1%204%2C4M18%2C7A1%2C1%200%200%2C1%2019%2C8A1%2C1%200%200%2C1%2018%2C9A1%2C1%200%200%2C1%2017%2C8A1%2C1%200%200%2C1%2018%2C7M14%2C7A1%2C1%200%200%2C1%2015%2C8A1%2C1%200%200%2C1%2014%2C9A1%2C1%200%200%2C1%2013%2C8A1%2C1%200%200%2C1%2014%2C7M20%2C6H4V10H20V6M4%2C19H20V12H4V19M6%2C7A1%2C1%200%200%2C1%207%2C8A1%2C1%200%200%2C1%206%2C9A1%2C1%200%200%2C1%205%2C8A1%2C1%200%200%2C1%206%2C7M13%2C14H15L18%2C17H16L13%2C14Z%22%20%2F%3E%3C%2Fsvg%3E",
    "trash": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M9%2C3V4H4V6H5V19A2%2C2%200%200%2C0%207%2C21H17A2%2C2%200%200%2C0%2019%2C19V6H20V4H15V3H9M9%2C8H11V17H9V8M13%2C8H15V17H13V8Z%22%20%2F%3E%3C%2Fsvg%3E",
    "tv": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M21%2C17H3V5H21M21%2C3H3A2%2C2%200%200%2C0%201%2C5V17A2%2C2%200%200%2C0%203%2C19H8V21H16V19H21A2%2C2%200%200%2C0%2023%2C17V5A2%2C2%200%200%2C0%2021%2C3Z%22%20%2F%3E%3C%2Fsvg%3E",
    "vacuum": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12%2C2C14.65%2C2%2017.19%2C3.06%2019.07%2C4.93L17.65%2C6.35C16.15%2C4.85%2014.12%2C4%2012%2C4C9.88%2C4%207.84%2C4.84%206.35%2C6.35L4.93%2C4.93C6.81%2C3.06%209.35%2C2%2012%2C2M3.66%2C6.5L5.11%2C7.94C4.39%2C9.17%204%2C10.57%204%2C12A8%2C8%200%200%2C0%2012%2C20A8%2C8%200%200%2C0%2020%2C12C20%2C10.57%2019.61%2C9.17%2018.88%2C7.94L20.34%2C6.5C21.42%2C8.12%2022%2C10.04%2022%2C12A10%2C10%200%200%2C1%2012%2C22A10%2C10%200%200%2C1%202%2C12C2%2C10.04%202.58%2C8.12%203.66%2C6.5M12%2C6A6%2C6%200%200%2C1%2018%2C12C18%2C13.59%2017.37%2C15.12%2016.24%2C16.24L14.83%2C14.83C14.08%2C15.58%2013.06%2C16%2012%2C16C10.94%2C16%209.92%2C15.58%209.17%2C14.83L7.76%2C16.24C6.63%2C15.12%206%2C13.59%206%2C12A6%2C6%200%200%2C1%2012%2C6M12%2C8A1%2C1%200%200%2C0%2011%2C9A1%2C1%200%200%2C0%2012%2C10A1%2C1%200%200%2C0%2013%2C9A1%2C1%200%200%2C0%2012%2C8Z%22%20%2F%3E%3C%2Fsvg%3E",
    "washer": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M14.83%2C11.17C16.39%2C12.73%2016.39%2C15.27%2014.83%2C16.83C13.27%2C18.39%2010.73%2C18.39%209.17%2C16.83L14.83%2C11.17M6%2C2H18A2%2C2%200%200%2C1%2020%2C4V20A2%2C2%200%200%2C1%2018%2C22H6A2%2C2%200%200%2C1%204%2C20V4A2%2C2%200%200%2C1%206%2C2M7%2C4A1%2C1%200%200%2C0%206%2C5A1%2C1%200%200%2C0%207%2C6A1%2C1%200%200%2C0%208%2C5A1%2C1%200%200%2C0%207%2C4M10%2C4A1%2C1%200%200%2C0%209%2C5A1%2C1%200%200%2C0%2010%2C6A1%2C1%200%200%2C0%2011%2C5A1%2C1%200%200%2C0%2010%2C4M12%2C8A6%2C6%200%200%2C0%206%2C14A6%2C6%200%200%2C0%2012%2C20A6%2C6%200%200%2C0%2018%2C14A6%2C6%200%200%2C0%2012%2C8Z%22%20%2F%3E%3C%2Fsvg%3E",
}

export function getIcon(type: string, defaultType = "socket"): string {
    return MDI_ICONS[type] ?? MDI_ICONS[defaultType];
}
