// totalCount: 전체 게시물 수, viewList: 화면에 보여질 게시물 수, blockLink: 하단 링크 수
const pagination = (totalCount, page, viewList, blockLink)=> {
    let nowPage = Number(page); // 현재 페이지
    let totalLink = Math.ceil(totalCount / viewList); // 총 페이지 링크 수

    if(!nowPage || Number.isNaN(nowPage) || nowPage > totalLink) nowPage = 1;

    let offset = (nowPage - 1) * viewList; // SQL offset 보여질 범위 0 ~ 10 
    let linkStart = Math.floor((nowPage - 1) / blockLink ) * blockLink + 1; // 블럭 시작 숫자
    let linkEnd = linkStart + blockLink - 1; // 블럭 끝 숫자
    let linkPrev = linkStart -1;
    let linkNext = linkEnd +1;
    
    if (nowPage > totalLink || linkEnd > totalLink) linkEnd = totalLink;

    return { totalCount, nowPage, viewList, blockLink, totalLink, offset, linkStart, linkEnd, linkPrev, linkNext }
}

module.exports = pagination;