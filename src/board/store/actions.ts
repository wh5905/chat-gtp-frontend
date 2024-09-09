import { ActionContext } from "vuex"
import { Board, BoardState } from "./states"
import { AxiosResponse } from "axios"
import axiosInst from "@/utility/axiosInstance"
import { REQUEST_BOARD_LIST_TO_DJANGO } from "./mutation-types"

export type BoardActions = {
    requestBoardToDjango(context: ActionContext<BoardState, any>, boardId: number): Promise<void>
    requestBoardListToDjango(context: ActionContext<BoardState, any>): Promise<void>
    requestCreateBoardToDjango(context: ActionContext<BoardState, unknown>, payload: {
        title: string, writer: string, content: string
    }): Promise<AxiosResponse>
    requestDeleteBoardToDjango(context: ActionContext<BoardState, unknown>, boardId: number): Promise<void>
    requestModifyBoardToDjango(context: ActionContext<BoardState, any>, payload: {
        title: string, content: string, boardId: number
    }): Promise<void>
    requestSearchStockNameToDjango(
        context: ActionContext<BoardState, any>,
        input: string
    ): Promise<any>
}

const actions: BoardActions = {
    async requestBoardToDjango(context: ActionContext<BoardState, any>, boardId: number): Promise<void> {
        try {
            const res: AxiosResponse<Board> = await axiosInst.djangoAxiosInst.get(`/board/read/${boardId}`);
            console.log('data:', res.data)
            context.commit('REQUEST_BOARD_TO_DJANGO', res.data);
        } catch (error) {
            console.error('requestBoardToDjango() 문제 발생:', error);
            throw error
        }
    },
    async requestBoardListToDjango(context: ActionContext<BoardState, any>): Promise<void> {
        try {
            const res: AxiosResponse<any, any> = await axiosInst.djangoAxiosInst.get('/board/list/');
            console.log('data:', res)
            const data: Board[] = res.data;
            console.log('data:', data)
            context.commit('REQUEST_BOARD_LIST_TO_DJANGO', data);
        } catch (error) {
            console.error('Error fetching board list:', error);
            // 에러를 처리할 수 있는 추가 로직
            throw error
        }
    },
    async requestCreateBoardToDjango(context: ActionContext<BoardState, unknown>, payload: {
        title: string, writer: string, content: string
    }): Promise<AxiosResponse> {

        console.log('requestCreateBoardToDjango()')

        const { title, writer, content } = payload
        console.log('전송할 데이터:', { title, writer, content })

        try {
            const res: AxiosResponse = await axiosInst.djangoAxiosInst.post(
                '/board/register', { title, writer, content})

            console.log('res:', res.data)
            return res.data
        } catch (error) {
            alert('requestCreateBoardToDjango() 문제 발생!')
            throw error
        }
    },
    async requestDeleteBoardToDjango(context: ActionContext<BoardState, unknown>, boardId: number): Promise<void> {
        try {
            console.log('requestDeleteBoardToDjango()')
            await axiosInst.djangoAxiosInst.delete(`/board/delete/${boardId}`)
        } catch (error) {
            console.log('requestDeleteBoardToDjango() 과정에서 문제 발생')
            throw error
        }
    },
    async requestModifyBoardToDjango(context: ActionContext<BoardState, any>, payload: {
        title: string, content: string, boardId: number
    }): Promise<void> {
        
        const { title, content, boardId } = payload

        try {
            await axiosInst.djangoAxiosInst.put(`/board/modify/${boardId}`, { title, content })
            console.log('수정 성공!')
        } catch (error) {
            console.log('requestModifyBoardToDjango() 과정에서 문제 발생')
            throw error
        }
    },
    async requestSearchStockNameToDjango(
        context: ActionContext<BoardState, any>,
        stockName: string
    ): Promise<any> {
        try {
            console.log('requestSearchStockNameToDjango()');
            const ticker = await axiosInst.djangoAxiosInst.post('/board/search-ticker', { stockName: stockName });
            return ticker.data;
        } catch (error) {
            console.log('requestSearchStockNameToDjango() 중 문제 발생:', error);
    
            const err = error as any;  // error를 any 타입으로 캐스팅
    
            if (err.response && err.response.status === 500) {
                // 404 오류가 발생하면 사용자에게 알림을 띄웁니다.
                alert('요청하신 이름과 일치하는 종목이 존재하지 않습니다.');
            } else {
                // 그 외의 오류 처리
                alert('알 수 없는 오류가 발생했습니다.');
            }
            return null
        }
    }
};

export default actions;